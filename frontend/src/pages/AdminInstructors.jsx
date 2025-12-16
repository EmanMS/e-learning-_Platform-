import { useEffect, useState } from 'react'
import axios from 'axios'
import { Container, Card, Table, Button, Badge, Spinner } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'

function AdminInstructors() {
    const [instructors, setInstructors] = useState([])
    const [loading, setLoading] = useState(true)
    const token = localStorage.getItem('token')
    const navigate = useNavigate()

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/admin/instructors/', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                setInstructors(res.data)
                setLoading(false)
            })
            .catch(err => setLoading(false))
    }, [])

    const handleDelete = async (id, isSuperuser) => {
        // حماية في الفرونت إند كمان
        if (isSuperuser) {
            alert("⛔ Cannot delete a Super Admin!")
            return
        }

        if (window.confirm("Are you sure? This will delete the instructor and all their courses.")) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/admin/instructor/delete/${id}/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                setInstructors(instructors.filter(i => i.id !== id))
                alert("Deleted Successfully")
            } catch (err) {
                alert("Error deleting instructor")
            }
        }
    }

    if (loading) return <Container className="text-center py-5"><Spinner animation="border" /></Container>

    return (
        <Container className="py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold"><i class="fas fa-chalkboard-teacher text-primary me-2"></i> Manage Instructors</h2>
                    <p className="text-muted">Total: {instructors.length} Instructors</p>
                </div>
                <Link to="/admin/dashboard" className="btn btn-light rounded-pill border">
                    <i class="fas fa-arrow-left me-2"></i> Back
                </Link>
            </div>

            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <Table hover responsive className="mb-0 align-middle">
                    <thead className="bg-light">
                        <tr>
                            <th className="ps-4">Instructor</th>
                            <th>Role</th>
                            <th class="text-center">Courses</th>
                            <th class="text-center">Students</th>
                            <th class="text-end pe-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {instructors.map(inst => (
                            <tr key={inst.id}>
                                <td className="ps-4">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-info text-white rounded-circle d-flex align-items-center justify-content-center fw-bold me-3 shadow-sm" style={{ width: '45px', height: '45px' }}>
                                            {inst.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-0">
                                                {/* ✅ تحويل الاسم لرابط يودي لصفحة التفاصيل */}
                                                <Link to={`/admin/instructor/${inst.id}`} className="text-decoration-none text-dark">
                                                    {inst.username}
                                                </Link>
                                            </h6>
                                            <small class="text-muted">{inst.email}</small>
                                        </div>
                                    </div>
                                </td>


                                {inst.is_superuser ? (
                                    // حالة لو هو أدمن
                                    <Badge bg="warning" text="dark" className="px-3">
                                        <i className="fas fa-shield-alt me-1"></i> Admin
                                    </Badge>
                                ) : (
                                    // حالة لو هو مدرب عادي
                                    <Badge bg="light" text="dark" className="border">
                                        Instructor
                                    </Badge>
                                )}

                                <td class="text-center fw-bold">{inst.courses_count}</td>
                                <td class="text-center fw-bold">{inst.students_count}</td>
                                <td class="text-end pe-4">
                                    {inst.is_superuser ? (
                                        // ✅ الحالة الأولى: لو أدمن (محمي)
                                        <span className="badge bg-secondary bg-opacity-10 text-secondary border">
                                            <i className="fas fa-user-shield me-1"></i> Protected
                                        </span>
                                    ) : (
                                        // ✅ الحالة الثانية: لو مدرب عادي (يظهر أزرار التحكم)
                                        <div className="d-flex justify-content-end gap-2">
                                            <Link to={`/admin/instructor/edit/${inst.id}`} className="btn btn-sm btn-light border text-warning" title="Edit">
                                                <i class="fas fa-pen"></i>
                                            </Link>

                                            <Button
                                                variant="light"
                                                size="sm"
                                                className="border text-danger hover-danger"
                                                onClick={() => handleDelete(inst.id)}
                                                title="Delete"
                                            >
                                                <i class="fas fa-trash"></i>
                                            </Button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>
        </Container>
    )
}
export default AdminInstructors