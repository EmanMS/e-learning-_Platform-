# In a new file: permissions.py or in views.py
from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied
from django.shortcuts import redirect
from functools import wraps

def student_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('login')
        
        # Check if user has student profile
        if hasattr(request.user, 'userprofile') and request.user.userprofile.role == 'student':
            return view_func(request, *args, **kwargs)
        else:
            raise PermissionDenied("Student access required")
    return _wrapped_view

def instructor_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('login')
        
        # Check if user has instructor profile
        if hasattr(request.user, 'userprofile') and request.user.userprofile.role == 'instructor':
            return view_func(request, *args, **kwargs)
        else:
            raise PermissionDenied("Instructor access required")
    return _wrapped_view

def admin_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('login')
        
        # Check if user has admin profile or is superuser
        if (hasattr(request.user, 'userprofile') and request.user.userprofile.role == 'admin') or request.user.is_superuser:
            return view_func(request, *args, **kwargs)
        else:
            raise PermissionDenied("Admin access required")
    return _wrapped_view