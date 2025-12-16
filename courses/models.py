from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import Avg

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('instructor', 'Instructor'),
        ('admin', 'Admin'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    bio = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.role}"

class Instructor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='instructor')
    bio = models.TextField()
    specialization = models.CharField(max_length=100)
    profile_picture = models.ImageField(upload_to='instructors/', blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)
    is_approved = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.specialization}"
    
    @property
    def total_courses(self):
        return self.course_set.count()
    
    @property
    def total_students(self):
        from django.db.models import Count
        return self.course_set.aggregate(total=Count('enrolled_students'))['total'] or 0

class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    instructor = models.ForeignKey(Instructor, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    thumbnail = models.ImageField(upload_to='course_thumbnails/', blank=True, null=True)
    category = models.CharField(max_length=100, default='Development')
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.title
    
    @property
    def total_lessons(self):
        return self.lesson_set.count()
    
    @property
    def total_enrollments(self):
        return self.enrolled_students.count()
    
    def get_rating_average(self):
        # بنحسب متوسط تقييمات المراجعات المرتبطة بالكورس ده
        reviews = self.reviews.all() 
        if reviews:
            return reviews.aggregate(Avg('rating'))['rating__avg']
        return 0

    def get_review_count(self):
        # بنحسب عدد المراجعات
        return self.reviews.count()


class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student')
    enrolled_courses = models.ManyToManyField(Course, blank=True, related_name='enrolled_students')
    profile_picture = models.ImageField(upload_to='students/', blank=True, null=True)

    def __str__(self):
        return f"Student: {self.user.username}"
    
    def get_completed_lessons_count(self, course):
        return LessonProgress.objects.filter(
            student=self, 
            lesson__course=course, 
            completed=True
        ).count()
    
    def get_course_progress(self, course):
        total_lessons = course.total_lessons
        if total_lessons == 0:
            return 0
        completed_lessons = self.get_completed_lessons_count(course)
        return (completed_lessons / total_lessons) * 100

class Lesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    content = models.TextField()
    video_url = models.URLField(blank=True)
    order = models.IntegerField(default=0)
    duration = models.IntegerField(default=0, help_text="Duration in minutes")
    
    class Meta:
        ordering = ['order']
        
    def __str__(self):
        return f"{self.order}. {self.title} - {self.course.title}"

class LessonProgress(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='lesson_progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='student_progress')
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ['student', 'lesson']
        
    def __str__(self):
        return f"{self.student.user.username} - {self.lesson.title}"



class Review(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='reviews')
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    rating = models.IntegerField(default=5) # من 1 لـ 5
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['course', 'student'] # الطالب يقيم الكورس مرة واحدة بس

    def __str__(self):
        return f"{self.rating} Stars - {self.course.title}"

# --- إضافة دالة حساب المتوسط داخل موديل Course ---
# ارجعي لـ class Course وضيفي الدالة دي جواه:
    
    # (داخل class Course)
    def get_rating_average(self):
        reviews = self.reviews.all()
        if reviews:
            return reviews.aggregate(models.Avg('rating'))['rating__avg']
        return 0

    def get_review_count(self):
        return self.reviews.count()
    

class Enrollment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['student', 'course']
    
    def __str__(self):
        return f"{self.student.user.username} - {self.course.title}"
    
# AUTO CREATE PROFILES - Add this at the END of models.py
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        # 1. Create UserProfile
        UserProfile.objects.create(user=instance, role='student')
        
        # 2. Create Student (Default)
        # ✅ التصحيح: نستخدم instance (الذي هو الـ User) بدلاً من user_profile
        try:
            Student.objects.create(user=instance)
        except Exception as e:
            print(f"Error creating student profile: {e}")


class Payment(models.Model):
    order_id = models.CharField(max_length=100, unique=True) # رقم الفاتورة عندنا
    payment_id = models.CharField(max_length=100, blank=True, null=True) # رقم العملية في Stripe
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2) # المبلغ المدفوع
    date = models.DateTimeField(auto_now_add=True)
    status = models.BooleanField(default=False) # هل الدفع تم بنجاح؟

    def __str__(self):
        return f"Order {self.order_id} - {self.student.user.username} - {self.course.title}"
    

class Wishlist(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'course') # عشان ميكررش الكورس مرتين في المفضلة

    def __str__(self):
        return f"{self.student.user.username} - {self.course.title}"