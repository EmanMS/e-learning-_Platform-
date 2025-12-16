from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth.models import User
from django.db.models import Avg, Count
from django.db.models import Q 
from .models import Course, Lesson, Student, Instructor, LessonProgress, UserProfile
from .permissions import student_required, instructor_required, admin_required
from .forms import ReviewForm
from .models import Review , Wishlist
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.lib.units import inch
import datetime
import stripe
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import CourseSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from django.views.decorators.csrf import csrf_exempt
from .models import Review, Wishlist
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status 
from rest_framework.permissions import IsAdminUser
from .models import Student, Instructor 
from rest_framework.parsers import MultiPartParser, FormParser # عشان الصور


# تهيئة Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

# ========== UTILITY: CREATE PROFILES FOR EXISTING USERS ==========
def ensure_profiles_exist():
    """Helper to fix any missing profiles"""
    for user in User.objects.all():
        if not hasattr(user, 'userprofile'):
            try:
                user_profile = UserProfile.objects.create(user=user, role='student')
                Student.objects.create(user_profile=user_profile)
            except:
                pass
# Run once on start (optional, safe to keep)
ensure_profiles_exist()


# ========== CONTEXT PROCESSOR ==========
def user_profile_context(request):
    context = {}
    if request.user.is_authenticated:
        if hasattr(request.user, 'userprofile'):
            context['user_role'] = request.user.userprofile.role
        else:
            UserProfile.objects.create(user=request.user, role='student')
            Student.objects.get_or_create(user=request.user)
            context['user_role'] = 'student'
    return context


# ========== PUBLIC VIEWS ==========

def home(request):
    if Course.objects.count() == 0:
        create_sample_courses()
    
    total_courses = Course.objects.count()
    total_students = Student.objects.count()
    total_instructors = Instructor.objects.count()
    
    featured_courses = Course.objects.all().order_by('-created_at')[:3]
    
    return render(request, 'courses/home.html', {
        'featured_courses': featured_courses,
        'total_courses': total_courses or 120,
        'total_students': total_students or 15000,
        'total_instructors': total_instructors or 85,
    })

def course_list(request):
    # 1. الأساس: كل الكورسات
    courses = Course.objects.all().order_by('-created_at')
    
    # 2. منطق البحث (Search Logic)
    search_query = request.GET.get('q')
    if search_query:
        courses = courses.filter(
            Q(title__icontains=search_query) | 
            Q(description__icontains=search_query) |
            Q(instructor__user__username__icontains=search_query)
        )
    
    # 3. منطق الفلترة (Category Filter)
    category_filter = request.GET.get('category')
    if category_filter and category_filter != 'All':
        courses = courses.filter(category=category_filter)

    context = {
        'courses': courses,
        'search_query': search_query, 
        'selected_category': category_filter
    }
    return render(request, 'courses/course_list.html', context)

def course_detail(request, course_id):
    # 1. جلب الكورس والدروس
    course = get_object_or_404(Course, id=course_id)
    lessons = Lesson.objects.filter(course=course).order_by('order')
    
    # 2. جلب بيانات التقييمات
    reviews = course.reviews.all().order_by('-created_at')
    avg_rating = course.get_rating_average()
    review_count = course.get_review_count()
    
    # 3. تجهيز المتغيرات الافتراضية
    is_enrolled = False
    completed_lessons = []
    progress_percentage = 0
    completed_count = 0
    total_lessons = lessons.count()
    review_form = None 
    
    if request.user.is_authenticated:
        try:
            # التحقق مما إذا كان المستخدم طالباً
            if hasattr(request.user, 'student'):
                student = request.user.student
                is_enrolled = student.enrolled_courses.filter(id=course_id).exists()
                
                if is_enrolled:
                    # أ. منطق حساب التقدم
                    completed_lessons = LessonProgress.objects.filter(
                        student=student,
                        lesson__course=course,
                        completed=True
                    ).values_list('lesson_id', flat=True)
                    
                    completed_count = len(completed_lessons)
                    if total_lessons > 0:
                        progress_percentage = int((completed_count / total_lessons) * 100)
                    
                    # ب. منطق التقييم
                    user_review = Review.objects.filter(course=course, student=student).first()
                    review_form = ReviewForm(instance=user_review)

        except Student.DoesNotExist:
            pass
    
    return render(request, 'courses/course_detail.html', {
        'course': course,
        'lessons': lessons,
        'is_enrolled': is_enrolled,
        'completed_lessons': list(completed_lessons),
        'progress_percentage': progress_percentage,
        'completed_count': completed_count,
        'total_lessons': total_lessons,
        'reviews': reviews,
        'review_form': review_form,
        'avg_rating': avg_rating,
        'review_count': review_count,
    })

# ========== AUTHENTICATION ==========

def signup(request):
    if request.method == 'POST':
        username = request.POST['username']
        email = request.POST['email']
        password1 = request.POST['password1']
        password2 = request.POST['password2']
        role = request.POST['account_type']
        
        if password1 != password2:
            messages.error(request, "Passwords don't match")
            return redirect('signup')
        
        try:
            user = User.objects.create_user(username=username, email=email, password=password1)
            
            # تحديث الدور
            user_profile = user.userprofile
            user_profile.role = role
            user_profile.save()
            
            if role == 'instructor':
                if hasattr(user, 'student'): user.student.delete()
                Instructor.objects.create(user=user, bio="Instructor Bio", specialization="General")
                messages.success(request, f"Instructor account created for {user.username}!")
            else:
                messages.success(request, f"Student account created for {user.username}!")
            
            login(request, user)
            return redirect('home')
            
        except Exception as e:
            messages.error(request, f"Error: {str(e)}")
    
    return render(request, 'registration/signup.html')

def user_login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            messages.success(request, f"Welcome back, {username}!")
            return redirect('dashboard') # Smart redirect
        else:
            messages.error(request, "Invalid credentials")
    
    return render(request, 'registration/login.html')

def user_logout(request):
    logout(request)
    messages.success(request, "Logged out successfully")
    return redirect('home')

@login_required
def profile_settings(request):
    user = request.user
    
    if request.method == 'POST':
        try:
            # 1. Basic Info
            user.first_name = request.POST.get('first_name')
            user.last_name = request.POST.get('last_name')
            user.email = request.POST.get('email')
            user.save()
            
            # 2. Instructor Info
            if hasattr(user, 'instructor'):
                instructor = user.instructor
                instructor.bio = request.POST.get('bio')
                instructor.specialization = request.POST.get('specialization')
                if request.FILES.get('profile_picture'):
                    instructor.profile_picture = request.FILES.get('profile_picture')
                instructor.save()
            
            # 3. Student Info (Image)
            elif hasattr(user, 'student'):
                student = user.student
                if request.FILES.get('profile_picture'):
                    student.profile_picture = request.FILES.get('profile_picture')
                student.save()
            
            messages.success(request, "Profile updated successfully!")
            return redirect('profile_settings')
            
        except Exception as e:
            messages.error(request, f"Error updating profile: {e}")
            
    return render(request, 'dashboard/settings.html')


# ========== STUDENT VIEWS ==========

@student_required
def student_dashboard(request):
    try:
        student = request.user.student
        enrolled_courses = student.enrolled_courses.all()
        
        completed_lessons_total = 0
        for course in enrolled_courses:
            completed_lessons_total += LessonProgress.objects.filter(
                student=student, lesson__course=course, completed=True
            ).count()
        
        context = {
            'student': student,
            'enrolled_courses': enrolled_courses,
            'total_courses': enrolled_courses.count(),
            'completed_lessons': completed_lessons_total,
            'in_progress_courses': enrolled_courses.count(), 
            'achievements': 3,
        }
        return render(request, 'dashboard/student_dashboard.html', context)
    except:
        return redirect('home')

@student_required
def enroll_course(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    student = request.user.student
    
    if student.enrolled_courses.filter(id=course_id).exists():
        return redirect('course_detail', course_id=course_id)
    
    student.enrolled_courses.add(course)
    messages.success(request, f"Enrolled in {course.title}!")
    return redirect('course_detail', course_id=course_id)

@student_required
def my_courses(request):
    student = request.user.student
    enrolled_courses = student.enrolled_courses.all()
    
    # تجهيز بيانات الكورسات مع نسبة التقدم
    courses_data = []
    for course in enrolled_courses:
        progress = student.get_course_progress(course)
        courses_data.append({
            'course': course,
            'progress': int(progress),
            'completed_lessons': student.get_completed_lessons_count(course),
            'total_lessons': course.total_lessons
        })
    
    return render(request, 'courses/my_courses.html', {'courses_data': courses_data})

@student_required
def mark_lesson_complete(request, lesson_id):
    lesson = get_object_or_404(Lesson, id=lesson_id)
    student = request.user.student
    
    if student.enrolled_courses.filter(id=lesson.course.id).exists():
        progress, created = LessonProgress.objects.get_or_create(
            student=student, lesson=lesson, defaults={'completed': True}
        )
        if not created:
            progress.completed = True
            progress.save()
        messages.success(request, "Lesson Completed!")
        
    return redirect('course_detail', course_id=lesson.course.id)

@student_required
def add_review(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    student = request.user.student
    
    if not student.enrolled_courses.filter(id=course.id).exists():
        messages.error(request, "Enroll to rate.")
        return redirect('course_detail', course_id=course.id)

    if request.method == 'POST':
        form = ReviewForm(request.POST)
        if form.is_valid():
            Review.objects.update_or_create(
                course=course,
                student=student,
                defaults={
                    'rating': form.cleaned_data['rating'],
                    'comment': form.cleaned_data['comment']
                }
            )
            messages.success(request, "Review submitted!")
            
    return redirect('course_detail', course_id=course.id)

# --- STRIPE PAYMENTS ---
@login_required
def create_checkout_session(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    student = request.user.student

    if course.price == 0:
        student.enrolled_courses.add(course)
        messages.success(request, "Successfully enrolled in free course!")
        return redirect('course_detail', course_id=course.id)

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {'name': course.title},
                    'unit_amount': int(course.price * 100),
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=settings.DOMAIN_URL + f'payment/success/{course.id}/?session_id={{CHECKOUT_SESSION_ID}}',
            cancel_url=settings.DOMAIN_URL + f'course/{course.id}/',
            client_reference_id=request.user.id,
        )
        return redirect(checkout_session.url, code=303)
    except Exception as e:
        messages.error(request, f"Payment Error: {str(e)}")
        return redirect('course_detail', course_id=course.id)

@login_required
def payment_success(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    student = request.user.student
    session_id = request.GET.get('session_id')
    
    if session_id:
        student.enrolled_courses.add(course)
        messages.success(request, f"Payment Successful! Enrolled in {course.title}")
        return redirect('course_detail', course_id=course.id)
    
    return redirect('home')

# --- CERTIFICATES ---
@login_required
def download_certificate(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    student = request.user.student
    
    completed_lessons = LessonProgress.objects.filter(student=student, lesson__course=course, completed=True).count()
    total_lessons = course.lesson_set.count()
    
    if total_lessons == 0 or completed_lessons != total_lessons:
        messages.error(request, "Complete all lessons first!")
        return redirect('course_detail', course_id=course.id)

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="Certificate - {course.title}.pdf"'

    p = canvas.Canvas(response, pagesize=landscape(letter))
    width, height = landscape(letter)
    
    # Drawing the Certificate
    p.setStrokeColor(colors.darkblue)
    p.setLineWidth(5)
    p.rect(30, 30, width-60, height-60)
    
    p.setFont("Helvetica-Bold", 36)
    p.setFillColor(colors.darkblue)
    p.drawCentredString(width/2, height - 150, "Certificate of Completion")
    
    p.setFont("Helvetica", 18)
    p.setFillColor(colors.black)
    p.drawCentredString(width/2, height - 200, "This is to certify that")
    
    p.setFont("Helvetica-Bold", 30)
    p.setFillColor(colors.darkred)
    p.drawCentredString(width/2, height - 250, f"{request.user.first_name} {request.user.last_name}")
    
    p.setFont("Helvetica", 18)
    p.setFillColor(colors.black)
    p.drawCentredString(width/2, height - 300, "Has successfully completed")
    
    p.setFont("Helvetica-Bold", 24)
    p.drawCentredString(width/2, height - 350, f"'{course.title}'")
    
    current_date = datetime.date.today().strftime("%B %d, %Y")
    p.setFont("Helvetica", 14)
    p.drawString(100, 100, f"Date: {current_date}")
    p.drawRightString(width-100, 100, "E-Learn Platform")
    
    p.showPage()
    p.save()
    return response


# ========== INSTRUCTOR VIEWS ==========

@instructor_required
def instructor_dashboard(request):
    instructor = request.user.instructor
    courses = Course.objects.filter(instructor=instructor)
    total_students = Student.objects.filter(enrolled_courses__instructor=instructor).distinct().count()
    total_lessons = Lesson.objects.filter(course__instructor=instructor).count()
    
    context = {
        'total_courses': courses.count(),
        'total_students': total_students,
        'total_lessons': total_lessons,
        'total_revenue': 0, # Placeholder
        'courses': courses
    }
    return render(request, 'dashboard/instructor_dashboard.html', context)

@instructor_required
def create_course(request):
    instructor = request.user.instructor
    if request.method == 'POST':
        try:
            Course.objects.create(
                title=request.POST.get('title'),
                description=request.POST.get('description'),
                instructor=instructor,
                price=request.POST.get('price', 0),
                is_paid=request.POST.get('is_paid') == 'on',
                category=request.POST.get('category'),
                thumbnail=request.FILES.get('thumbnail')
            )
            messages.success(request, "Course created!")
            return redirect('instructor_dashboard')
        except Exception as e:
            messages.error(request, f"Error: {e}")
    return render(request, 'instructors/create_course.html')

@instructor_required
def edit_course(request, course_id):
    instructor = request.user.instructor
    course = get_object_or_404(Course, id=course_id, instructor=instructor)
    
    if request.method == 'POST':
        course.title = request.POST.get('title')
        course.description = request.POST.get('description')
        course.price = request.POST.get('price')
        course.category = request.POST.get('category')
        course.is_paid = request.POST.get('is_paid') == 'on'
        if request.FILES.get('thumbnail'):
            course.thumbnail = request.FILES.get('thumbnail')
        course.save()
        messages.success(request, "Course updated!")
        return redirect('instructor_dashboard')
        
    return render(request, 'instructors/edit_course.html', {'course': course})

@instructor_required
def delete_course(request, course_id):
    instructor = request.user.instructor
    course = get_object_or_404(Course, id=course_id, instructor=instructor)
    if request.method == 'POST':
        course.delete()
        messages.success(request, "Course deleted!")
    return redirect('instructor_dashboard')

@instructor_required
def add_lesson(request, course_id):
    instructor = request.user.instructor
    course = get_object_or_404(Course, id=course_id, instructor=instructor)
    
    if request.method == 'POST':
        order = course.lesson_set.count() + 1
        Lesson.objects.create(
            course=course,
            title=request.POST.get('title'),
            content=request.POST.get('content'),
            video_url=request.POST.get('video_url'),
            order=order
        )
        messages.success(request, "Lesson added!")
        return redirect('course_detail', course_id=course.id)
    return render(request, 'instructors/add_lesson.html', {'course': course})

@instructor_required
def instructor_profile(request, instructor_id):
    instructor = get_object_or_404(Instructor, id=instructor_id)
    return render(request, 'instructors/instructor_profile.html', {'instructor': instructor})

@instructor_required
def instructor_students(request):
    instructor = request.user.instructor
    students = Student.objects.filter(enrolled_courses__instructor=instructor).distinct()
    return render(request, 'instructors/my_students.html', {'students': students, 'total_count': students.count()})


# ========== ADMIN VIEWS ==========

@admin_required
def admin_dashboard(request):
    actual_students_count = UserProfile.objects.filter(role='student').count()
    context = {
        'total_users': User.objects.count(),
        'total_courses': Course.objects.count(),
        'total_instructors': Instructor.objects.count(),
        'total_students': actual_students_count,
        'courses': Course.objects.all().order_by('-created_at')[:10],
        'active_courses_count': Course.objects.filter(is_active=True).count(),
        'verified_instructors': Instructor.objects.filter(is_approved=True).count(),
    }
    return render(request, 'dashboard/admin_dashboard.html', context)

@admin_required
def admin_course_create(request):
    if request.method == 'POST':
        try:
            instructor_id = request.POST.get('instructor')
            instructor = get_object_or_404(Instructor, id=instructor_id) if instructor_id else Instructor.objects.first()
            
            Course.objects.create(
                title=request.POST.get('title'),
                description=request.POST.get('description'),
                instructor=instructor,
                price=request.POST.get('price', 0),
                is_paid=request.POST.get('is_paid') == 'on',
                category=request.POST.get('category'),
                thumbnail=request.FILES.get('thumbnail')
            )
            messages.success(request, "Course created successfully!")
            return redirect('admin_dashboard')
        except Exception as e:
            messages.error(request, f"Error: {e}")
            
    return render(request, 'admin/create_course.html', {'instructors': Instructor.objects.all()})

@admin_required
def admin_course_edit(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    if request.method == 'POST':
        course.title = request.POST.get('title')
        course.description = request.POST.get('description')
        course.price = request.POST.get('price')
        course.is_paid = request.POST.get('is_paid') == 'on'
        course.category = request.POST.get('category')
        course.is_active = request.POST.get('is_active') == 'on'
        
        instructor_id = request.POST.get('instructor')
        if instructor_id:
            course.instructor = get_object_or_404(Instructor, id=instructor_id)
            
        if request.FILES.get('thumbnail'):
            course.thumbnail = request.FILES.get('thumbnail')
            
        course.save()
        messages.success(request, "Course updated!")
        return redirect('admin_dashboard')

    return render(request, 'admin/edit_course.html', {
        'course': course, 
        'instructors': Instructor.objects.all()
    })

@admin_required
def admin_course_delete(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    if request.method == 'POST':
        course.delete()
        messages.success(request, "Course deleted!")
    return redirect('admin_dashboard')

@admin_required
def admin_add_lesson(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    if request.method == 'POST':
        order = course.lesson_set.count() + 1
        Lesson.objects.create(
            course=course,
            title=request.POST.get('title'),
            content=request.POST.get('content'),
            video_url=request.POST.get('video_url'),
            order=order
        )
        messages.success(request, "Lesson added!")
        return redirect('admin_course_edit', course_id=course.id)
    return render(request, 'instructors/add_lesson.html', {'course': course})

@admin_required
def admin_instructors(request):
    instructors = Instructor.objects.all()
    return render(request, 'admin/instructors.html', {'instructors': instructors})

@admin_required
def admin_add_instructor(request):
    if request.method == 'POST':
        user = User.objects.create_user(
            username=request.POST['username'],
            email=request.POST['email'],
            password=request.POST['password']
        )
        user.userprofile.role = 'instructor'
        user.userprofile.save()
        if hasattr(user, 'student'): user.student.delete()
        Instructor.objects.create(
            user=user,
            bio=request.POST.get('bio'),
            specialization=request.POST.get('specialization'),
            is_approved=True
        )
        messages.success(request, "Instructor added!")
        return redirect('admin_instructors')
    return render(request, 'admin/add_instructor.html')

@admin_required
def admin_edit_instructor(request, instructor_id):
    instructor = get_object_or_404(Instructor, id=instructor_id)
    if instructor.user.is_superuser:
        messages.error(request, "Cannot edit superuser.")
        return redirect('admin_instructors')
        
    if request.method == 'POST':
        instructor.user.first_name = request.POST.get('first_name')
        instructor.user.last_name = request.POST.get('last_name')
        instructor.user.email = request.POST.get('email')
        instructor.user.save()
        
        instructor.bio = request.POST.get('bio')
        instructor.specialization = request.POST.get('specialization')
        instructor.is_approved = request.POST.get('is_approved') == 'on'
        instructor.save()
        
        messages.success(request, "Instructor updated!")
        return redirect('admin_instructors')
    return render(request, 'admin/edit_instructor.html', {'instructor': instructor})

@admin_required
def admin_delete_instructor(request, instructor_id):
    instructor = get_object_or_404(Instructor, id=instructor_id)
    if not instructor.user.is_superuser:
        instructor.user.delete()
        messages.success(request, "Instructor deleted!")
    return redirect('admin_instructors')

@admin_required
def admin_students(request):
    # Self-healing list of students
    student_profiles = UserProfile.objects.filter(role='student')
    students_list = []
    for profile in student_profiles:
        student, _ = Student.objects.get_or_create(user=profile.user)
        students_list.append(student)
    
    students_list.sort(key=lambda x: x.user.date_joined, reverse=True)
    return render(request, 'admin/students.html', {'students': students_list})

@admin_required
def admin_add_student(request):
    if request.method == 'POST':
        user = User.objects.create_user(
            username=request.POST['username'],
            email=request.POST['email'],
            password=request.POST['password']
        )
        UserProfile.objects.create(user=user, role='student')
        Student.objects.create(user=user)
        messages.success(request, "Student added!")
        return redirect('admin_students')
    return render(request, 'admin/add_student.html')

@admin_required
def admin_edit_student(request, student_id):
    student = get_object_or_404(Student, id=student_id)
    if request.method == 'POST':
        student.user.first_name = request.POST.get('first_name')
        student.user.last_name = request.POST.get('last_name')
        student.user.email = request.POST.get('email')
        student.user.save()
        messages.success(request, "Student updated!")
        return redirect('admin_students')
    return render(request, 'admin/edit_student.html', {'student': student})

@admin_required
def admin_delete_student(request, student_id):
    student = get_object_or_404(Student, id=student_id)
    student.user.delete()
    messages.success(request, "Student deleted!")
    return redirect('admin_students')

@admin_required
def admin_student_detail(request, student_id):
    student = get_object_or_404(Student, id=student_id)
    enrolled = student.enrolled_courses.all()
    available = Course.objects.exclude(id__in=enrolled.values_list('id', flat=True))
    
    if request.method == 'POST':
        course = get_object_or_404(Course, id=request.POST.get('course_to_add'))
        student.enrolled_courses.add(course)
        messages.success(request, "Course added to student!")
        return redirect('admin_student_detail', student_id=student.id)
        
    return render(request, 'admin/student_detail.html', {
        'student': student, 'enrolled_courses': enrolled, 'available_courses': available
    })

@admin_required
def admin_unenroll_student_course(request, student_id, course_id):
    student = get_object_or_404(Student, id=student_id)
    course = get_object_or_404(Course, id=course_id)
    student.enrolled_courses.remove(course)
    messages.warning(request, "Student unenrolled.")
    return redirect('admin_student_detail', student_id=student.id)

def admin_enroll_student_course(request, student_id, course_id):
    pass # Unused placeholder

# ========== DASHBOARD ROUTING ==========
@login_required
def dashboard(request):
    user = request.user
    
    # 1. Superuser -> Admin
    if user.is_superuser:
        return redirect('admin_dashboard')

    # 2. Fix Missing Profiles
    if not hasattr(user, 'userprofile'):
        UserProfile.objects.create(user=user, role='student')
        Student.objects.create(user=user)
        return redirect('student_dashboard')
    
    # 3. Route by Role
    role = user.userprofile.role
    if role == 'admin': return redirect('admin_dashboard')
    elif role == 'instructor': 
        if not hasattr(user, 'instructor'): Instructor.objects.create(user=user, bio="Bio", specialization="Gen")
        return redirect('instructor_dashboard')
    else: 
        if not hasattr(user, 'student'): Student.objects.create(user=user)
        return redirect('student_dashboard')

# ========== UTILITY FUNCTIONS ==========
def create_sample_courses():
    pass

# --- 1. تصحيح دالة عرض الكورسات ---
@api_view(['GET'])
@permission_classes([AllowAny]) # السماح للزوار بالمشاهدة
def api_course_list(request):
    # 1. جلب الكورسات
        # 1. الافتراضي: نجيب النشط فقط
    courses = Course.objects.filter(is_active=True).order_by('-created_at')

    # 2. استثناء: لو أدمن، يشوف كل الكورسات
    if request.user.is_authenticated and request.user.is_superuser:
         courses = Course.objects.all().order_by('-created_at')

    # 2. البحث
    search_query = request.GET.get('q')
    if search_query:
        courses = courses.filter(
            Q(title__icontains=search_query) | 
            Q(description__icontains=search_query) |
            Q(instructor__user__username__icontains=search_query)
        )
    
    # 3. الفلترة
    category_filter = request.GET.get('category')
    if category_filter and category_filter != 'All':
        courses = courses.filter(category=category_filter)

    # ✅✅ التصحيح هنا: 
    # بنستخدم courses (جمع)
    # بنبعت context عشان الـ Wishlist تشتغل
    serializer = CourseSerializer(courses, many=True, context={'request': request})
    
    return Response(serializer.data)


# --- 2. تصحيح دالة تفاصيل الكورس ---
@api_view(['GET'])
def api_course_detail(request, course_id):
    # استخدام prefetch_related عشان السرعة
    course = get_object_or_404(
        Course.objects.prefetch_related('lesson_set', 'reviews', 'instructor__user'), 
        id=course_id
    )
    
    # ✅✅ التصحيح: سطر واحد فقط للسيريلايزر
    serializer = CourseSerializer(course, context={'request': request})
    data = serializer.data 

    # القيم الافتراضية
    data['is_enrolled'] = False 
    data['progress'] = 0 

    if request.user.is_authenticated:
        try:
            # التحقق لو كان المستخدم طالباً
            if hasattr(request.user, 'student'):
                student = request.user.student
                
                # فحص الاشتراك
                if student.enrolled_courses.filter(id=course.id).exists():
                    data['is_enrolled'] = True
                    
                    # حساب البروجرس
                    total_lessons = course.lesson_set.count()
                    completed = LessonProgress.objects.filter(
                        student=student, 
                        lesson__course=course, 
                        completed=True
                    ).count()
                    
                    if total_lessons > 0:
                        data['progress'] = int((completed / total_lessons) * 100)
                
                # فحص الويشليست (إضافي للتأكيد بجانب السيريلايزر)
                if Wishlist.objects.filter(student=student, course=course).exists():
                    data['in_wishlist'] = True
                else:
                    data['in_wishlist'] = False
        except Exception as e:
            print(f"Error in details: {e}")
            pass
    
    return Response(data)


@api_view(['POST'])
@permission_classes([AllowAny]) # مسموح لأي حد يسجل
def api_signup(request):
    data = request.data
    
    # 1. التأكد إن اليوزر نيم مش مكرر
    if User.objects.filter(username=data.get('username')).exists():
        return Response({'error': 'Username already exists!'}, status=status.HTTP_400_BAD_REQUEST)
    
    # 2. التأكد إن الإيميل مش مكرر (اختياري بس مفضل)
    if User.objects.filter(email=data.get('email')).exists():
        return Response({'error': 'Email already exists!'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # 3. إنشاء المستخدم الأساسي
        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', '')
        )

        # 4. تحديد نوع المستخدم وإنشاء البروفايل
        user_type = data.get('user_type', 'student') # Default student

        if user_type == 'instructor':
            # لو مدرب، بنعمله بروفايل مدرب
            Instructor.objects.create(
                user=user,
                bio="New Instructor", # قيم افتراضية عشان ميديور ايرور
                specialization="General"
            )
        else:
            # لو طالب (أو أي حاجة تانية)، بنعمله بروفايل طالب
            Student.objects.create(user=user)

        # 5. (خطوة إضافية) نرجع رسالة نجاح واضحة
        return Response({'message': 'Account created successfully!'}, status=status.HTTP_201_CREATED)

    except Exception as e:
        # لو حصل أي خطأ، امسح اليوزر اللي اتعمل عشان الداتا بيز متتبهدلش
        if 'user' in locals():
            user.delete()
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])  # ⛔ ممنوع الدخول لغير المسجلين
def api_my_courses(request):
    try:
        student = request.user.student
        enrolled_courses = student.enrolled_courses.all()
        serializer = CourseSerializer(enrolled_courses, many=True)
        return Response(serializer.data)
    except:
        return Response([]) # لو حصل خطأ رجع قائمة فاضية

@api_view(['POST']) # لازم تكون POST عشان ده إجراء بيغير داتا
@permission_classes([IsAuthenticated])
def api_enroll_course(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    student = request.user.student

    # 1. لو الطالب مشترك أصلاً
    if student.enrolled_courses.filter(id=course.id).exists():
        return Response({'status': 'already_enrolled', 'message': 'You are already enrolled!'})

    # 2. لو الكورس مجاني
    if course.price == 0:
        student.enrolled_courses.add(course)
        return Response({'status': 'enrolled', 'message': 'Successfully enrolled in free course!'})

    # 3. لو الكورس بفلوس (Stripe)
    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {'name': course.title},
                        'unit_amount': int(course.price * 100),
                    },
                    'quantity': 1,
                },
            ],
            mode='payment',
            # هنا هنرجع لصفحة رياكت (لو رفعتي الموقع غيري localhost لرابط الموقع)
            success_url=f'http://localhost:5173/payment-success/{course.id}', # هنبعت رقم الكورس للفرونت
            cancel_url=f'http://localhost:5173/course/{course.id}',
            client_reference_id=request.user.id,
            metadata={'course_id': course.id}
        )
        # ⚠️ الفرق الجوهري: بنرجع الرابط في JSON مش بنعمل redirect
        return Response({'status': 'payment_required', 'url': checkout_session.url})

    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_confirm_enrollment(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    student = request.user.student
    
    # إضافة الطالب للكورس
    student.enrolled_courses.add(course)
    
    return Response({'status': 'enrolled'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_mark_lesson_complete(request, lesson_id):
    lesson = get_object_or_404(Lesson, id=lesson_id)
    student = request.user.student
    
    # 1. تسجيل الدرس كمكتمل
    LessonProgress.objects.get_or_create(student=student, lesson=lesson, defaults={'completed': True})
    
    # 2. حساب البروجرس الجديد وإرساله لـ React عشان يحدث نفسه فوراً
    course = lesson.course
    total_lessons = course.lesson_set.count()
    completed_count = LessonProgress.objects.filter(student=student, lesson__course=course, completed=True).count()
    new_progress = int((completed_count / total_lessons) * 100) if total_lessons > 0 else 0
    
    return Response({'status': 'success', 'new_progress': new_progress})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_certificate(request, course_id):
    # 1. جلب البيانات
    course = get_object_or_404(Course, id=course_id)
    student = request.user.student
    
    # 2. التحقق من الإكمال (Security Check)
    completed_lessons = LessonProgress.objects.filter(student=student, lesson__course=course, completed=True).count()
    total_lessons = course.lesson_set.count()
    
    if total_lessons == 0 or completed_lessons != total_lessons:
        # لو مخلصش، نرجع 403 Forbidden
        return HttpResponse("You must complete the course first.", status=403)

    # 3. تجهيز ملف الـ PDF
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="Certificate - {course.title}.pdf"'

    # 4. إعداد الرسم (Canvas)
    p = canvas.Canvas(response, pagesize=landscape(letter))
    width, height = landscape(letter)
    
    # --- 🎨 بداية التصميم القديم الشيك 🎨 ---
    
    # الإطار (Border)
    p.setStrokeColor(colors.darkblue)
    p.setLineWidth(5)
    p.rect(30, 30, width-60, height-60)
    
    # العنوان (Title)
    p.setFont("Helvetica-Bold", 36)
    p.setFillColor(colors.darkblue)
    p.drawCentredString(width/2, height - 150, "Certificate of Completion")
    
    # المقدمة
    p.setFont("Helvetica", 18)
    p.setFillColor(colors.black)
    p.drawCentredString(width/2, height - 200, "This is to certify that")
    
    # اسم الطالب (Student Name)
    p.setFont("Helvetica-Bold", 30)
    p.setFillColor(colors.darkred)
    # بنجيب الاسم من اليوزر الحالي اللي باعت التوكن
    student_name = f"{request.user.first_name} {request.user.last_name}" if request.user.first_name else request.user.username
    p.drawCentredString(width/2, height - 250, student_name)
    
    # جملة الإكمال
    p.setFont("Helvetica", 18)
    p.setFillColor(colors.black)
    p.drawCentredString(width/2, height - 300, "Has successfully completed the course")
    
    # اسم الكورس
    p.setFont("Helvetica-Bold", 24)
    p.drawCentredString(width/2, height - 350, f"'{course.title}'")
    
    # التاريخ واللوجو
    current_date = datetime.date.today().strftime("%B %d, %Y")
    p.setFont("Helvetica", 14)
    p.drawString(100, 100, f"Date: {current_date}")
    p.drawRightString(width-100, 100, "E-Learn Platform")
    
    # --- نهاية التصميم ---

    p.showPage()
    p.save()
    return response

# 1. تأكدي إن الاستيرادات دي موجودة فوق خالص في الملف
from django.views.decorators.csrf import csrf_exempt
from .models import Review # تأكدي إنك مستوردة الموديل

# 2. انسخي الدالة دي في آخر الملف
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@csrf_exempt  # 👈 ده الحل السحري لمشكلة الـ 403
def api_add_review(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    student = request.user.student
    
    # التأكد إن الطالب مشترك
    if not student.enrolled_courses.filter(id=course.id).exists():
        return Response({'error': 'You must be enrolled to review'}, status=403)

    # حفظ البيانات
    data = request.data
    review, created = Review.objects.update_or_create(
        course=course,
        student=student,
        defaults={
            'rating': data.get('rating'),
            'comment': data.get('comment')
        }
    )
    
    return Response({'status': 'success', 'message': 'Review added!'})

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def api_profile_settings(request):
    user = request.user
    
    # --- GET: إرسال البيانات ---
    if request.method == 'GET':
        role = 'admin' if user.is_superuser else user.userprofile.role
        
        # تجهيز رابط الصورة بناءً على النوع
        pic_url = None
        if hasattr(user, 'instructor') and user.instructor.profile_picture:
            pic_url = request.build_absolute_uri(user.instructor.profile_picture.url)
        elif hasattr(user, 'student') and user.student.profile_picture:
            pic_url = request.build_absolute_uri(user.student.profile_picture.url)

        data = {
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'role': role,
            'bio': getattr(user.instructor, 'bio', '') if hasattr(user, 'instructor') else '',
            'specialization': getattr(user.instructor, 'specialization', '') if hasattr(user, 'instructor') else '',
            'profile_picture': pic_url
        }
        return Response(data)

    # --- PUT: التحديث ---
    elif request.method == 'PUT':
        user.first_name = request.data.get('first_name', user.first_name)
        user.last_name = request.data.get('last_name', user.last_name)
        user.email = request.data.get('email', user.email)
        
        # تغيير الباسورد (Security Tab)
        new_pass = request.data.get('new_password')
        if new_pass:
            user.set_password(new_pass)
        
        user.save()
        
        # تحديث المدرب
        if hasattr(user, 'instructor'):
            inst = user.instructor
            inst.bio = request.data.get('bio', inst.bio)
            inst.specialization = request.data.get('specialization', inst.specialization)
            if request.FILES.get('profile_picture'):
                inst.profile_picture = request.FILES['profile_picture']
            inst.save()
            
        # تحديث الطالب (✅ هنا الحل البرمجي)
        elif hasattr(user, 'student'):
            student = user.student
            if request.FILES.get('profile_picture'):
                student.profile_picture = request.FILES['profile_picture']
            student.save()

        return Response({'status': 'success', 'message': 'Profile updated!'})


# API: Instructor Dashboard Stats & Courses
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_instructor_dashboard(request):
    # التأكد إنه مدرب
    if not hasattr(request.user, 'instructor'):
        return Response({'error': 'Not an instructor'}, status=403)
        
    instructor = request.user.instructor
    courses = Course.objects.filter(instructor=instructor)
    
    # الإحصائيات
    total_students = Student.objects.filter(enrolled_courses__instructor=instructor).distinct().count()
    total_courses = courses.count()
    
    # نستخدم المترجم عشان نرجع قائمة الكورسات
    serializer = CourseSerializer(courses, many=True)
    
    return Response({
        'stats': {
            'total_students': total_students,
            'total_courses': total_courses,
            'total_revenue': 1500, # رقم وهمي حالياً
        },
        'courses': serializer.data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_create_course(request):
    # التأكد إن اليوزر عنده بروفايل مدرب
    if not hasattr(request.user, 'instructor'):
        return Response({'error': 'You must be an instructor to create courses'}, status=403)
        
    instructor = request.user.instructor
    data = request.data
    
    try:
        new_course = Course.objects.create(
            instructor=instructor,
            title=data.get('title'),
            description=data.get('description'),
            category=data.get('category'),
            price=data.get('price') or 0, # لو مبعتش سعر نخليه 0
            is_paid=(data.get('is_paid') == 'true'), # التحويل من نص لـ Boolean مهم جداً في React
            thumbnail=request.FILES.get('thumbnail') 
        )
        return Response({'status': 'success', 'course_id': new_course.id})
    except Exception as e:
        print("Create Course Error:", e) # طباعة الخطأ في التيرمينال
        return Response({'error': str(e)}, status=400)
    
    
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def api_instructor_edit_course(request, course_id):
    try:
        instructor = request.user.instructor
        course = Course.objects.get(id=course_id, instructor=instructor)
    except:
        return Response({'error': 'Course not found or access denied'}, status=403)

    if request.method == 'GET':
        return Response(CourseSerializer(course).data)

    elif request.method == 'PUT':
        # partial=True عشان لو المدرب عدل حقل واحد بس، الباقي مايتمسحش
        serializer = CourseSerializer(course, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'status': 'success'})
        return Response(serializer.errors, status=400)


# 2. دالة تعديل الكورس للأدمن (يعدل أي كورس)
@api_view(['PUT'])
@permission_classes([IsAdminUser])
def api_admin_edit_course(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    
    serializer = CourseSerializer(course, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({'status': 'success', 'message': 'Course updated by Admin!'})
    return Response(serializer.errors, status=400)


# 3. دالة حذف الكورس (للأدمن أو المدرب صاحب الكورس)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_delete_course(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    
    # لو أدمن أو هو صاحب الكورس -> اسمح بالحذف
    if request.user.is_superuser or course.instructor.user == request.user:
        course.delete()
        return Response({'status': 'success', 'message': 'Course deleted'})
    
    return Response({'error': 'Permission denied'}, status=403)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_instructor_add_lesson(request, course_id):
    instructor = request.user.instructor
    course = get_object_or_404(Course, id=course_id, instructor=instructor) # أمان: لازم يكون صاحبه
    
    data = request.data
    Lesson.objects.create(
        course=course,
        title=data.get('title'),
        video_url=data.get('video_url'),
        content=data.get('content'),
        order=course.lesson_set.count() + 1
    )
    return Response({'status': 'success'})


# API مخصص للأدمن فقط (بيجيب إحصائيات الموقع كله)
@api_view(['GET'])
@permission_classes([IsAdminUser]) # حماية: للأدمن فقط
def api_admin_dashboard(request):
    # 1. إحصائيات عامة
    total_users = User.objects.count()
    total_students = Student.objects.count()
    total_instructors = Instructor.objects.count()
    total_courses = Course.objects.count()
    
    # 2. آخر الكورسات المضافة (عشان نعرضها في الجدول)
    recent_courses = Course.objects.all().order_by('-created_at')
    serializer = CourseSerializer(recent_courses, many=True)
    
    return Response({
        'stats': {
            'total_users': total_users,
            'total_students': total_students,
            'total_instructors': total_instructors,
            'total_courses': total_courses,
            'total_revenue': 56000, # رقم وهمي أو ممكن نحسبه من جدول المدفوعات
        },
        'courses': serializer.data
    })

@api_view(['GET'])
@permission_classes([IsAdminUser])
def api_all_students(request):
    students = Student.objects.all().order_by('-user__date_joined')
    data = []
    for s in students:
        data.append({
            'id': s.id,
            'username': s.user.username,
            'email': s.user.email,
            'date_joined': s.user.date_joined,
            'courses_count': s.enrolled_courses.count(),
        })
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def api_all_instructors(request):
    instructors = Instructor.objects.all()
    data = []
    for inst in instructors:
        data.append({
            'id': inst.id,
            'username': inst.user.username,
            'email': inst.user.email,
            'courses_count': inst.course_set.count(),
            'students_count': inst.total_students, # التأكد من وجود الخاصية دي في المودل
            'specialization': inst.specialization
        })
    return Response(data)

# 1. تفاصيل طالب معين (للأدمن)
@api_view(['GET'])
@permission_classes([IsAdminUser])
def api_student_detail_admin(request, student_id):
    student = get_object_or_404(Student, id=student_id)
    courses = student.enrolled_courses.all()
    
    # تحضير الداتا
    courses_data = []
    for c in courses:
        courses_data.append({
            'title': c.title,
            'category': c.category,
            'progress': student.get_course_progress(c)
        })

    return Response({
        'id': student.id,
        'username': student.user.username,
        'email': student.user.email,
        'date_joined': student.user.date_joined,
        'profile_picture': request.build_absolute_uri(student.profile_picture.url) if student.profile_picture else None,
        'enrolled_courses': courses_data
    })

@api_view(['GET', 'PUT'])
@permission_classes([IsAdminUser])
def api_admin_edit_student(request, student_id):
    student = get_object_or_404(Student, id=student_id)
    user = student.user
    
    # GET: عرض البيانات الحالية
    if request.method == 'GET':
        return Response({
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email
        })
    
    # PUT: تحديث البيانات
    elif request.method == 'PUT':
        user.first_name = request.data.get('first_name', user.first_name)
        user.last_name = request.data.get('last_name', user.last_name)
        user.email = request.data.get('email', user.email)
        user.save()
        return Response({'status': 'success', 'message': 'Student updated successfully!'})
    
# 2. تفاصيل مدرب معين (للأدمن)
@api_view(['GET'])
@permission_classes([IsAdminUser])
def api_instructor_detail_admin(request, instructor_id):
    instructor = get_object_or_404(Instructor, id=instructor_id)
    courses = Course.objects.filter(instructor=instructor)
    
    return Response({
        'id': instructor.id,
        'username': instructor.user.username,
        'email': instructor.user.email,
        'bio': instructor.bio,
        'specialization': instructor.specialization,
        'total_students': instructor.total_students,
        'courses_count': courses.count(),
        'profile_picture': request.build_absolute_uri(instructor.profile_picture.url) if instructor.profile_picture else None,
        'courses': CourseSerializer(courses, many=True).data # نستخدم المترجم الجاهز
    })



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_instructor_students(request):
    # التأكد إنه مدرب
    if not hasattr(request.user, 'instructor'):
        return Response({'error': 'Not Instructor'}, status=403)
        
    instructor = request.user.instructor
    # نجيب الطلبة المشتركين في كورساته
    students = Student.objects.filter(enrolled_courses__instructor=instructor).distinct()
    
    data = []
    for s in students:
        # بنجيب الكورسات اللي الطالب ده واخدها مع المدرب ده
        student_courses = s.enrolled_courses.filter(instructor=instructor).values_list('title', flat=True)
        data.append({
            'id': s.id,
            'name': s.user.username,
            'email': s.user.email,
            'date_joined': s.user.date_joined,
            'courses': list(student_courses) # قائمة بأسماء الكورسات
        })
        
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_toggle_course_status(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    
    # التحقق من الصلاحية (أدمن أو صاحب الكورس)
    if not request.user.is_superuser and course.instructor.user != request.user:
        return Response({'error': 'Permission denied'}, status=403)
        
    course.is_active = not course.is_active # اعكس الحالة
    course.save()
    
    return Response({'status': 'success', 'is_active': course.is_active})



# 1. API: Toggle Wishlist (Add/Remove)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_toggle_wishlist(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    student = request.user.student
    
    # لو موجود امسحه، لو مش موجود ضيفه
    wishlist_item, created = Wishlist.objects.get_or_create(student=student, course=course)
    
    if not created:
        wishlist_item.delete()
        return Response({'status': 'removed', 'message': 'Removed from wishlist'})
    
    return Response({'status': 'added', 'message': 'Added to wishlist'})

# 2. API: Get My Wishlist
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_my_wishlist(request):
    student = request.user.student
    wishlist_items = Wishlist.objects.filter(student=student)
    # بنجيب الكورسات اللي جوه الـ Wishlist
    courses = [item.course for item in wishlist_items]
    serializer = CourseSerializer(courses, many=True)
    return Response(serializer.data)



@api_view(['GET'])
@permission_classes([AllowAny]) # ✅ مسموح للكل (Public)
def api_public_instructor_profile(request, instructor_id):
    instructor = get_object_or_404(Instructor, id=instructor_id)
    
    # نجيب الكورسات النشطة لهذا المدرب
    courses = Course.objects.filter(instructor=instructor, is_active=True).order_by('-created_at')
    
    # نستخدم المترجم عشان الصور والبيانات تتبعت صح
    # (بعتنا request في الـ context عشان الصور تاخد الرابط الكامل)
    courses_data = CourseSerializer(courses, many=True, context={'request': request}).data

    # بيانات المدرب
    profile_data = {
        'id': instructor.id,
        'username': instructor.user.username,
        'full_name': f"{instructor.user.first_name} {instructor.user.last_name}".strip() or instructor.user.username,
        'bio': instructor.bio,
        'specialization': instructor.specialization,
        'profile_picture': request.build_absolute_uri(instructor.profile_picture.url) if instructor.profile_picture else None,
        'total_students': instructor.total_students, # التأكد من وجود الخاصية دي في المودل
        'total_courses': courses.count(),
        'courses': courses_data
    }
    
    return Response(profile_data)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def api_student_manage(request, student_id):
    student = get_object_or_404(Student, id=student_id)
    user = request.user
    
    # 1. السماح للمدربين والأدمن فقط
    if not (user.is_superuser or hasattr(user, 'instructor')):
        return Response({'error': 'Permission denied'}, status=403)

    # --- GET: عرض البيانات (متاح للاتنين) ---
    if request.method == 'GET':
        courses_data = []
        for c in student.enrolled_courses.all():
            courses_data.append({
                'id': c.id,
                'title': c.title,
                'progress': student.get_course_progress(c)
            })
            
        data = {
            'id': student.id,
            'username': student.user.username,
            'first_name': student.user.first_name,
            'last_name': student.user.last_name,
            'email': student.user.email,
            'date_joined': student.user.date_joined,
            'profile_picture': request.build_absolute_uri(student.profile_picture.url) if student.profile_picture else None,
            'courses': courses_data
        }
        return Response(data)

    # --- PUT: تعديل البيانات (للأدمن فقط) ---
    if request.method == 'PUT':
        if not user.is_superuser:
            return Response({'error': 'Only Admins can edit students'}, status=403)
            
        student.user.first_name = request.data.get('first_name', student.user.first_name)
        student.user.last_name = request.data.get('last_name', student.user.last_name)
        student.user.email = request.data.get('email', student.user.email)
        student.user.save()
        return Response({'status': 'success', 'message': 'Student updated successfully'})

    # --- DELETE: حذف الطالب (للأدمن فقط) ---
    if request.method == 'DELETE':
        if not user.is_superuser:
            return Response({'error': 'Only Admins can delete students'}, status=403)
            
        student.user.delete() # حذف اليوزر بيمسح الطالب
        return Response({'status': 'success', 'message': 'Student deleted permanently'})