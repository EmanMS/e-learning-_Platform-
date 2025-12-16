import { useEffect, useState } from 'react'
import axios from 'axios'
import { Container, Card, Table, Button, Spinner, Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'

function AdminStudents() {
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const token = localStorage.getItem('token')

    // دالة الحذف
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this student?")) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/admin/students/delete/${id}/`, { // تأكدي إن عندك API للحذف
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                setStudents(students.filter(s => s.id !== id)) // تحديث الجدول فوراً
                alert("Student deleted successfully")
            } catch (err) {
                alert("Error deleting student")
            }
        }
    }

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/admin/students/', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                setStudents(res.data)
                setLoading(false)
            })
    }, [])

    if (loading) return <Container className="text-center py-5"><Spinner animation="border" /></Container>

    return (
        <Container className="py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold"><i class="fas fa-users text-primary me-2"></i> Manage Students</h2>
                <Link to="/admin/dashboard" className="btn btn-light rounded-pill border">
                    <i class="fas fa-arrow-left me-2"></i> Back to Dashboard
                </Link>
            </div>

            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <Table hover responsive className="mb-0 align-middle">
                    <thead className="bg-light">
                        <tr>
                            <th className="ps-4 py-3">Student Name</th>
                            <th>Email</th>
                            <th>Enrolled</th>
                            <th>Joined</th>
                            <th class="text-end pe-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.id}>
                                <td className="ps-4">
                                    <div className="d-flex align-items-center">
                                        {/* Avatar الشكل القديم اللي بتحبيه */}
                                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold me-3 shadow-sm"
                                            style={{ width: '40px', height: '40px' }}>
                                            {student.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-0">
                                                {/* ✅ تحويل الاسم لرابط يودي لصفحة التفاصيل */}
                                                <Link to={`/student/${student.id}`} className="fw-bold text-dark text-decoration-none">
                                                    {student.username}
                                                </Link>

                                            </h6>
                                        </div>
                                    </div>
                                </td>

                                <td className="text-muted">{student.email}</td>
                                <td>
                                    <Badge bg="info" className="bg-opacity-10 text-info px-3 border border-info rounded-pill">
                                        {student.courses_count} Courses
                                    </Badge>
                                </td>
                                <td className="text-muted small">
                                    {new Date(student.date_joined).toLocaleDateString()}
                                </td>

                                <td className="text-end pe-4">
                                    <Link to={`/admin/student/edit/${student.id}`} className="action-btn text-warning" title="Edit Student">
                                        <i className="fas fa-pen"></i>
                                    </Link>

                                    <Button variant="light" size="sm" className="text-danger border" onClick={() => handleDelete(student.id)}>
                                        <i class="fas fa-trash-alt"></i>
                                    </Button>

                                </td>


                            </tr>
                        ))}
                    </tbody>
                </Table>

                {students.length === 0 && (
                    <div className="text-center py-5 text-muted">No students found.</div>
                )}
            </Card>
        </Container>
    )
}

export default AdminStudents