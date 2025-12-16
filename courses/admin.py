# courses/admin.py - النسخة النظيفة
from django.contrib import admin
from .models import Course, Lesson, Student, Instructor, LessonProgress

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'instructor', 'price', 'is_paid', 'created_at')
    list_filter = ('is_paid', 'created_at')
    search_fields = ('title', 'description')

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order')
    list_filter = ('course',)
    ordering = ('course', 'order')
    search_fields = ('title', 'content')

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('user', 'get_enrolled_courses_count')
    filter_horizontal = ('enrolled_courses',)
    
    def get_enrolled_courses_count(self, obj):
        return obj.enrolled_courses.count()
    get_enrolled_courses_count.short_description = 'Enrolled Courses'

@admin.register(Instructor)
class InstructorAdmin(admin.ModelAdmin):
    list_display = ('user', 'bio')
    search_fields = ('user__username', 'bio')

@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ('student', 'lesson', 'completed', 'completed_at')
    list_filter = ('completed', 'lesson__course')
    search_fields = ('student__user__username', 'lesson__title')
    readonly_fields = ('completed_at',)