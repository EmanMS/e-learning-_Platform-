# --- START OF FILE elearning_platform/urls.py ---

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # رابط أدمن جانجو الأصلي (اللوحة الزرقاء)
    path('admin/', admin.site.urls),
    
    # رابط تطبيق الكورسات (يستدعي ملف urls.py السابق)
    path('', include('courses.urls')),

    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'), # رابط اللوجين
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

# إعدادات لتمكين عرض الصور المرفوعة (Thumbnails & Profile Pictures)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)