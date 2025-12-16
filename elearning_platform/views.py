from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.models import User
from courses.models import Course, Instructor, Enrollment

def is_superuser(user):
    return user.is_superuser

def home(request):
    """الصفحة الرئيسية"""
    return render(request, 'home.html')

@login_required
@user_passes_test(is_superuser)
def admin_dashboard(request):
    # بيانات حقيقية من الداتابيز
    total_users = User.objects.count()
    total_courses = Course.objects.count()
    total_instructors = Instructor.objects.count()
    total_students = User.objects.filter(is_staff=False, is_superuser=False).count()
    
    # عدد الطلاب المسجلين في كورسات
    total_enrollments = Enrollment.objects.count()
    
    context = {
        'total_users': total_users,
        'total_courses': total_courses,
        'total_instructors': total_instructors,
        'total_students': total_students,
        'total_enrollments': total_enrollments,
    }
    return render(request, 'admin/dashboard.html', context)