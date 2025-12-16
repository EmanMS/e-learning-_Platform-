# courses/templatetags/course_tags.py
from django import template
from courses.models import Student

register = template.Library()

@register.simple_tag
def is_enrolled(user, course):
    """
    فانكشن بسيطة بتشوف هل اليوزر ده طالب ومشترك في الكورس ده ولا لا
    """
    if not user.is_authenticated:
        return False
    
    # لو أدمن أو مدرب، نعتبره مش مشترك (عشان تظهرله زراير التعديل)
    if hasattr(user, 'userprofile') and user.userprofile.role in ['admin', 'instructor']:
        return False

    try:
        student = user.student
        return student.enrolled_courses.filter(id=course.id).exists()
    except:
        return False