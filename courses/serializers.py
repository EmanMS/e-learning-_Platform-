from rest_framework import serializers
from .models import Course, Instructor, Lesson, Review, Wishlist # ✅ تأكدي من وجود Wishlist هنا

# 1. Lesson Serializer
class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'order', 'video_url', 'duration']

# 2. Instructor Serializer
class InstructorSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    email = serializers.EmailField(source='user.email')
    is_superuser = serializers.BooleanField(source='user.is_superuser', read_only=True)

    class Meta:
        model = Instructor
        fields = ['id', 'username', 'email', 'specialization', 'bio', 'is_superuser']

# 3. Review Serializer
class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='student.user.username')
    
    class Meta:
        model = Review
        fields = ['id', 'user', 'rating', 'comment', 'created_at']

# 4. Course Serializer (Main)
class CourseSerializer(serializers.ModelSerializer):
    instructor = InstructorSerializer()
    lessons = LessonSerializer(many=True, read_only=True, source='lesson_set') 
    reviews = ReviewSerializer(many=True, read_only=True)
    
    # حقول إضافية
    avg_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    in_wishlist = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'price', 'category', 'thumbnail', 
                  'instructor', 'lessons', 'reviews', 'avg_rating', 'review_count', 'in_wishlist' ,'total_enrollments', 'is_active']
    
    def get_avg_rating(self, obj):
        return obj.get_rating_average()

    def get_review_count(self, obj):
        return obj.get_review_count()
    
    def get_in_wishlist(self, obj):
        request = self.context.get('request')
        
        # ✅ الحماية: لو مفيش ريكوست أو يوزر مش مسجل، رجع False
        if not request or not request.user.is_authenticated:
            return False

        # ✅ الحماية: التأكد إنه طالب
        if hasattr(request.user, 'student'):
            return Wishlist.objects.filter(student=request.user.student, course=obj).exists()
            
        return False