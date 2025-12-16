# --- START OF FILE courses/urls.py ---

from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    # ========== مسارات عامة (Public) ==========
    path('', views.home, name='home'),
    path('courses/', views.course_list, name='course_list'),
    path('courses/<int:course_id>/', views.course_detail, name='course_detail'),

    # ========== مسارات الطالب (Student) ==========
    path('enroll/<int:course_id>/', views.enroll_course, name='enroll_course'),
    path('my-courses/', views.my_courses, name='my_courses'),
    path('mark-complete/<int:lesson_id>/', views.mark_lesson_complete, name='mark_lesson_complete'),
    path('dashboard/', views.dashboard, name='dashboard'), # الموجه الرئيسي
    path('dashboard/student/', views.student_dashboard, name='student_dashboard'),

    # ========== مسارات المصادقة (Auth) ==========
    path('signup/', views.signup, name='signup'),
    path('login/', views.user_login, name='login'),
    path('logout/', views.user_logout, name='logout'),
    
    # ========== مسارات المدرب (Instructor) ==========
    path('instructor/<int:instructor_id>/', views.instructor_profile, name='instructor_profile'),
    path('dashboard/instructor/', views.instructor_dashboard, name='instructor_dashboard'),
    path('dashboard/instructor/create/', views.create_course, name='create_course'),
    path('dashboard/instructor/edit/<int:course_id>/', views.edit_course, name='edit_course'),
    path('dashboard/instructor/delete/<int:course_id>/', views.delete_course, name='delete_course'),
    path('dashboard/instructor/students/', views.instructor_students, name='instructor_students'),
    path('dashboard/instructor/course/<int:course_id>/add-lesson/', views.add_lesson, name='add_lesson'),

    
    # ========== مسارات الأدمن المخصصة (Custom Admin) ==========
    # ✅ قمنا بتوحيد البداية بـ dashboard/admin لتجنب التعارض مع جانجو أدمن
    
    # 1. اللوحة الرئيسية
    path('dashboard/admin/', views.admin_dashboard, name='admin_dashboard'),
    
    # 2. إدارة الكورسات
    path('dashboard/admin/courses/create/', views.admin_course_create, name='admin_course_create'),
    path('dashboard/admin/courses/edit/<int:course_id>/', views.admin_course_edit, name='admin_course_edit'),
    path('dashboard/admin/courses/delete/<int:course_id>/', views.admin_course_delete, name='admin_course_delete'),
    path('dashboard/admin/course/<int:course_id>/add-lesson/', views.admin_add_lesson, name='admin_add_lesson'),

    # 3. إدارة المدربين
    path('dashboard/admin/instructors/', views.admin_instructors, name='admin_instructors'),
    path('dashboard/admin/instructors/add/', views.admin_add_instructor, name='admin_add_instructor'),
    path('dashboard/admin/instructors/edit/<int:instructor_id>/', views.admin_edit_instructor, name='admin_edit_instructor'),
    path('dashboard/admin/instructors/delete/<int:instructor_id>/', views.admin_delete_instructor, name='admin_delete_instructor'),
    
    # 4. إدارة الطلاب
    path('dashboard/admin/students/', views.admin_students, name='admin_students'),
    path('dashboard/admin/students/delete/<int:student_id>/', views.admin_delete_student, name='admin_delete_student'),
    path('dashboard/admin/students/edit/<int:student_id>/', views.admin_edit_student, name='admin_edit_student'),

    path('dashboard/admin/students/<int:student_id>/', views.admin_student_detail, name='admin_student_detail'),
    path('course/<int:course_id>/add_review/', views.add_review, name='add_review'),

    # إضافة كورس للطالب يدوياً
    path('dashboard/admin/students/<int:student_id>/enroll/<int:course_id>/', views.admin_enroll_student_course, name='admin_enroll_student_course'),
    
    # حذف كورس من الطالب
    path('dashboard/admin/students/<int:student_id>/unenroll/<int:course_id>/', views.admin_unenroll_student_course, name='admin_unenroll_student_course'),
    path('dashboard/admin/students/add/', views.admin_add_student, name='admin_add_student'),
    path('settings/', views.profile_settings, name='profile_settings'),
    

    path('checkout/<int:course_id>/', views.create_checkout_session, name='create_checkout_session'),
    path('payment/success/<int:course_id>/', views.payment_success, name='payment_success'),

    path('course/<int:course_id>/certificate/', views.download_certificate, name='download_certificate'),

   
   
    # ==============================================================
    # 🔥🔥🔥 API ROUTES (FOR REACT) - START HERE 🔥🔥🔥
    # ==============================================================

    # 1. Authentication
    path('api/signup/', views.api_signup, name='api_signup'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/profile/', views.api_profile_settings, name='api_profile_settings'),

    # 2. General Course Views
    path('api/courses/', views.api_course_list, name='api_course_list'),
    path('api/courses/<int:course_id>/', views.api_course_detail, name='api_course_detail'),

    # 3. Instructor APIs (Private)
    path('api/instructor/dashboard/', views.api_instructor_dashboard, name='api_instructor_dashboard'),
    path('api/instructor/create-course/', views.api_create_course, name='api_create_course'),
    
    # ✅ (مهم جداً) رابط تعديل الكورس للمدرب
    path('api/instructor/edit-course/<int:course_id>/', views.api_instructor_edit_course, name='api_instructor_edit_course'),
    
    # ✅ رابط حذف الكورس للمدرب
    path('api/instructor/course/<int:course_id>/delete/', views.api_delete_course, name='api_delete_course_inst'),
    
    path('api/instructor/course/<int:course_id>/add-lesson/', views.api_instructor_add_lesson, name='api_instructor_add_lesson'),
    path('api/instructor/students/', views.api_instructor_students, name='api_instructor_students'),

    # 4. Admin APIs (Private)
    path('api/admin/dashboard/', views.api_admin_dashboard, name='api_admin_dashboard'),
    
    # ✅ (مهم جداً) رابط تعديل الكورس للأدمن
    path('api/admin/course/edit/<int:course_id>/', views.api_admin_edit_course, name='api_admin_edit_course'),
    
    # ✅ رابط حذف الكورس للأدمن
    path('api/admin/course/delete/<int:course_id>/', views.api_delete_course, name='api_delete_course_admin'),

    path('api/admin/students/', views.api_all_students, name='api_all_students'),
    path('api/admin/instructors/', views.api_all_instructors, name='api_all_instructors'),
    path('api/admin/student/<int:student_id>/', views.api_student_detail_admin, name='api_student_detail_admin'),
    path('api/admin/instructor/<int:instructor_id>/', views.api_instructor_detail_admin, name='api_instructor_detail_admin'),

    # 5. Course Actions (Enroll, Toggle, Review)
    path('api/enroll/<int:course_id>/', views.api_enroll_course, name='api_enroll_course'),
    path('api/enroll/confirm/<int:course_id>/', views.api_confirm_enrollment, name='api_confirm_enrollment'),
    path('api/lesson/<int:lesson_id>/complete/', views.api_mark_lesson_complete, name='api_mark_lesson_complete'),
    path('api/course/<int:course_id>/add-review/', views.api_add_review, name='api_add_review'),
    path('api/course/<int:course_id>/toggle-status/', views.api_toggle_course_status, name='api_toggle_course_status'),
    path('api/my-courses/', views.api_my_courses, name='api_my_courses'),
    path('api/wishlist/toggle/<int:course_id>/', views.api_toggle_wishlist, name='api_toggle_wishlist'),
    path('api/wishlist/', views.api_my_wishlist, name='api_my_wishlist'),
    path('api/public/instructor/<int:instructor_id>/', views.api_public_instructor_profile, name='api_public_instructor_profile'),
    path('api/student/<int:student_id>/manage/', views.api_student_manage, name='api_student_manage'),
    path('api/admin/student/edit/<int:student_id>/', views.api_admin_edit_student, name='api_admin_edit_student'),

]

