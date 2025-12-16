import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Container, Spinner } from 'react-bootstrap'
import EditCourseForm from '../components/EditCourseForm' // نفس التصميم
import toast from 'react-hot-toast'

function AdminEditCourse() {
    const { id } = useParams()
    const [course, setCourse] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const token = localStorage.getItem('token')

    useEffect(() => {
        // الأدمن يقدر يجيب أي كورس
        axios.get(`http://127.0.0.1:8000/api/courses/${id}/`)
        .then(res => {
            setCourse(res.data) 
            setLoading(false)
        })
        .catch(err => {
            console.error(err)
            toast.error("Failed to load course")
            navigate('/dashboard/admin')
        })
    }, [id])

   const handleSubmit = async (e) => {
        e.preventDefault()
        const loadingToast = toast.loading('Updating Course...')
        
        try {
            // 1. استخدام FormData لضمان إرسال الصور والبيانات بشكل صحيح
            const formData = new FormData()
            
            // إضافة البيانات الأساسية
            formData.append('title', course.title)
            formData.append('description', course.description)
            formData.append('price', course.price)
            formData.append('category', course.category)
            
            // تحويل البولين لنص (عشان الـ FormData)
            formData.append('is_active', course.is_active ? 'True' : 'False')
            formData.append('is_paid', course.is_paid ? 'True' : 'False')

            // لو فيه صورة جديدة تم اختيارها (وليس رابط قديم)
            // ملاحظة: لو الصورة سترينج (رابط) متضيفيهاش، لو ملف ضيفيها
            if (course.thumbnail instanceof File) {
                formData.append('thumbnail', course.thumbnail)
            }
            
            // تحديد الرابط حسب الدور
            const endpoint = localStorage.getItem('role') === 'admin' 
                ? `http://127.0.0.1:8000/api/admin/course/edit/${id}/`
                : `http://127.0.0.1:8000/api/instructor/edit-course/${id}/`;

            await axios.put(endpoint, formData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data' // مهم جداً
                }
            })
            
            toast.dismiss(loadingToast)
            toast.success("Course Updated Successfully!")
            // navigate('/dashboard/admin') // اختياري
        } catch (err) {
            toast.dismiss(loadingToast)
            console.error(err)
            toast.error("Error updating course. Check console.")
        }
    }

    if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>

    return (
        <Container className="py-5">
            {/* هنا بنستخدم نفس القالب بس بنقوله إحنا أدمن */}
            <EditCourseForm 
                course={course} 
                setCourse={setCourse} 
                handleSubmit={handleSubmit} 
                loading={false}
                role="admin" 
            />
        </Container>
    )
}
export default AdminEditCourse