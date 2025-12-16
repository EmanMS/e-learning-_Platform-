import { Table, Badge, Form } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Swal from 'sweetalert2'

const CoursesTable = ({ courses, setCourses, isInstructor = false }) => {
    
    const token = localStorage.getItem('token')

    // دالة تغيير الحالة (Active/Draft)
    const toggleStatus = (id) => {
        axios.post(`http://127.0.0.1:8000/api/course/${id}/toggle-status/`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => {
            // تحديث الحالة في الفرونت إند فوراً
            const updatedCourses = courses.map(c => 
                c.id === id ? { ...c, is_active: res.data.is_active } : c
            )
            setCourses(updatedCourses)
            
            // تنبيه صغير
            const Toast = Swal.mixin({
                toast: true, position: 'top-end', showConfirmButton: false, timer: 1500
            })
            Toast.fire({
                icon: 'success', 
                title: res.data.is_active ? 'Course Published' : 'Course Hidden'
            })
        })
    }

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Delete course?',
            text: "This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete'
        }).then((result) => {
            if (result.isConfirmed) {
                // استخدمنا API الأدمن للحذف لأنه شامل
                const url = isInstructor 
                    ? `http://127.0.0.1:8000/api/instructor/course/${id}/delete/`
                    : `http://127.0.0.1:8000/api/admin/course/delete/${id}/`;

                axios.post(url, {}, { headers: { 'Authorization': `Bearer ${token}` } })
                .then(() => {
                    setCourses(courses.filter(c => c.id !== id))
                    Swal.fire('Deleted!', '', 'success')
                })
            }
        })
    }

    return (
        <Table hover responsive className="mb-0 align-middle">
            <thead className="bg-light text-secondary small text-uppercase">
                <tr>
                    <th className="ps-4 py-3 border-0">Course Details</th>
                    <th className="py-3 border-0">Instructor</th>
                    <th className="py-3 border-0 text-center">Enrolled</th>
                    <th className="py-3 border-0 text-center">Price</th>
                    <th className="py-3 border-0 text-center">Status</th>
                    <th className="py-3 border-0 text-end pe-4">Actions</th>
                </tr>
            </thead>
            <tbody className="border-top-0">
                {courses.map(course => (
                    <tr key={course.id}>
                        <td className="ps-4">
                            <div className="d-flex align-items-center">
                                <Link to={`/course/${course.id}`}>
                                    {course.thumbnail ? 
                                        <img src={`http://127.0.0.1:8000${course.thumbnail}`} 
                                             className="rounded-4 shadow-sm me-3 hover-scale" 
                                             style={{width:'50px', height:'50px', objectFit:'cover'}} />
                                        : 
                                        <div className="bg-light rounded-4 me-3 d-flex align-items-center justify-content-center border" style={{width:'50px', height:'50px'}}>📚</div>
                                    }
                                </Link>
                                <div>
                                    <Link to={`/course/${course.id}`} className="fw-bold text-dark text-decoration-none d-block mb-1 text-truncate" style={{maxWidth: '200px'}}>
                                        {course.title}
                                    </Link>
                                    <Badge bg="light" text="secondary" className="border fw-normal">{course.category}</Badge>
                                </div>
                            </div>
                        </td>
                        
                        <td>
                            <div className="d-flex align-items-center">
                                <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold me-2" style={{width:'30px', height:'30px', fontSize:'0.75rem'}}>
                                    {course.instructor.username.charAt(0).toUpperCase()}
                                </div>
                                <span className="small fw-semibold text-muted">{course.instructor.username}</span>
                            </div>
                        </td>

                        <td className="text-center fw-bold text-dark">{course.enrolled_students?.count || 0}</td>

                        <td className="text-center">
                            {course.price > 0 ? (
                                <span className="fw-bold text-dark">${course.price}</span>
                            ) : (
                                <Badge bg="success" className="bg-opacity-10 text-success">Free</Badge>
                            )}
                        </td>

                        <td className="text-center">
                            <Form.Check 
                                type="switch"
                                id={`status-${course.id}`}
                                checked={course.is_active}
                                onChange={() => toggleStatus(course.id)}
                                label={course.is_active ? <span className="text-success small fw-bold">Active</span> : <span className="text-muted small">Hidden</span>}
                                className="d-inline-block"
                            />
                        </td>
                        
                        <td className="text-end pe-4">
                            <div className="d-inline-flex gap-3 align-items-center">
                                <Link to={`/course/${course.id}`} className="text-primary icon-link" title="View">
                                    <i className="fas fa-eye fa-lg"></i>
                                </Link>
                                <Link to={`/instructor/edit-course/${course.id}`} className="text-warning icon-link" title="Edit">
                                    <i className="fas fa-pen fa-lg"></i>
                                </Link>
                                <span role="button" onClick={() => handleDelete(course.id)} className="text-danger icon-link" title="Delete">
                                    <i className="fas fa-trash fa-lg"></i>
                                </span>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    )
}

export default CoursesTable