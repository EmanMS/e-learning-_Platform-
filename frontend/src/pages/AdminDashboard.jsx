import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { Container, Row, Col, Card, Table, Badge, Spinner, Button, ProgressBar } from 'react-bootstrap'

function AdminDashboard() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const token = localStorage.getItem('token')

    useEffect(() => {
        // 1. التحقق من الدور محلياً
        const role = localStorage.getItem('role')
        const token = localStorage.getItem('token')

        if (role !== 'admin' || !token) {
            navigate('/login') // لو مش أدمن أو مفيش توكن، روح لوجين
            return;
        }

        // 2. طلب البيانات من السيرفر
        axios.get('http://127.0.0.1:8000/api/admin/dashboard/', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                console.log("Admin Data:", res.data)
                setData(res.data)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)

                // 🔥🔥 الإضافة الذكية هنا 🔥🔥
                if (err.response && err.response.status === 401) {
                    // لو السيرفر قال "غير مسموح" (التوكن خلص)
                    alert("Session expired. Please login again.")
                    localStorage.clear() // امسح الداتا القديمة
                    navigate('/login')   // وديه صفحة الدخول
                } else {
                    setLoading(false)
                }
            })
    }, [])

    const handleDeleteCourse = (id) => {
        if (window.confirm("Delete this course permanently?")) {
            axios.post(`http://127.0.0.1:8000/api/admin/course/delete/${id}/`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(() => window.location.reload())
        }
    }

    if (loading) return <Container className="text-center py-5"><Spinner animation="border" /></Container>
    if (!data) return <div className="text-center py-5">No Data</div>

    return (
        <Container className="py-5">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Admin Panel</h2>
                    <p className="text-muted mb-0">Overview of system performance.</p>
                </div>
                <Link to="/instructor/create" className="btn btn-primary px-4 py-2 fw-bold shadow-sm" style={{ backgroundColor: '#6366f1', borderColor: '#6366f1' }}>
                    <i class="fas fa-plus-circle me-2"></i>Create New Course
                </Link>
            </div>

            {/* 1. Stats Cards (Gradients) */}
            <Row className="g-4 mb-5">
                {/* Students */}
                <Col md={3}>
                    <Link to="/admin/students" className="text-decoration-none">
                        <Card className="border-0 shadow-sm h-100 p-3 hover-card text-white" style={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' }}>
                            <Card.Body>
                                <h6 className="text-white-50 text-uppercase mb-2">Students</h6>
                                <div className="d-flex justify-content-between align-items-end">
                                    <h2 className="fw-bold mb-0 display-5">{data.stats.total_students}</h2>
                                    <i class="fas fa-users fa-2x text-white-50"></i>
                                </div>
                            </Card.Body>
                        </Card>
                    </Link>
                </Col>

                {/* Instructors */}
                <Col md={3}>
                    <Link to="/admin/instructors" className="text-decoration-none">
                        <Card className="border-0 shadow-sm h-100 p-3 hover-card text-white" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
                            <Card.Body>
                                <h6 className="text-white-50 text-uppercase mb-2">Instructors</h6>
                                <div className="d-flex justify-content-between align-items-end">
                                    <h2 className="fw-bold mb-0 display-5">{data.stats.total_instructors}</h2>
                                    <i class="fas fa-chalkboard-teacher fa-2x text-white-50"></i>
                                </div>
                            </Card.Body>
                        </Card>
                    </Link>
                </Col>

                {/* Courses */}
                <Col md={3}>
                    <a href="#courses-table" className="text-decoration-none">
                        <Card className="border-0 shadow-sm h-100 p-3 hover-card text-white" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                            <Card.Body>
                                <h6 className="text-white-50 text-uppercase mb-2">Courses</h6>
                                <div className="d-flex justify-content-between align-items-end">
                                    <h2 className="fw-bold mb-0 display-5">{data.stats.total_courses}</h2>
                                    <i class="fas fa-book-open fa-2x text-white-50"></i>
                                </div>
                            </Card.Body>
                        </Card>
                    </a>
                </Col>

                {/* Revenue */}
                <Col md={3}>
                    <Card className="border-0 shadow-sm h-100 p-3 hover-card text-white" style={{ background: 'linear-gradient(135deg, #f09819 0%, #edde5d 100%)' }}>
                        <Card.Body>
                            <h6 className="text-white-50 text-uppercase mb-2">Total Revenue</h6>
                            <div className="d-flex justify-content-between align-items-end">
                                <h2 className="fw-bold mb-0 display-5">${data.stats.total_revenue}</h2>
                                <i class="fas fa-wallet fa-2x text-white-50"></i>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>


            {/* 3. Recent Courses Table (Improved Design) */}
             <Card 
                id="courses-table" 
                style={{ scrollMarginTop: '100px' }} 
                className="border-0 shadow-sm rounded-4 overflow-hidden mt-5"
            >
                <Card.Header className="bg-white border-0 py-4 px-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h5 className="fw-bold mb-1">Recent Courses Database</h5>
                        <p className="text-muted small mb-0">Manage all courses and their status</p>
                    </div>
                </Card.Header>

                <Table hover responsive className="mb-0 align-middle">
                    <thead>
                        <tr>
                            <th className="ps-4 py-3">Course Details</th>
                            <th className="py-3">Instructor</th>
                            <th className="py-3 text-center">Enrolled</th>
                            <th className="py-3 text-center">Price</th>
                            <th className="py-3 text-center">Status</th>
                            <th className="py-3 text-end pe-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.courses && data.courses.length > 0 ? (
                            data.courses.map(course => (
                                <tr key={course.id}>
                                    {/* Course Info */}
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center">
                                            <Link to={`/course/${course.id}`}>
                                                {course.thumbnail ?
                                                    <img src={`http://127.0.0.1:8000${course.thumbnail}`}
                                                        className="rounded-3 me-3 shadow-sm"
                                                        style={{ width: '55px', height: '55px', objectFit: 'cover' }} />
                                                    :
                                                    <div className="bg-secondary bg-opacity-10 rounded-3 me-3 d-flex align-items-center justify-content-center text-secondary border"
                                                        style={{ width: '55px', height: '55px' }}><i className="fas fa-image"></i></div>
                                                }
                                            </Link>
                                            <div>
                                                <Link to={`/course/${course.id}`} className="fw-bold text-decoration-none d-block mb-1" style={{ color: 'inherit' }}>
                                                    {course.title}
                                                </Link>
                                                <Badge bg="light" text="secondary" className="border fw-normal bg-opacity-50">
                                                    {course.category}
                                                </Badge>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Instructor */}
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div className="bg-primary bg-opacity-25 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold me-2"
                                                style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                                                {course.instructor.username.charAt(0).toUpperCase()}
                                            </div>
                                            <Link to={`/instructor/${course.instructor.id}`} className="fw-bold text-primary text-decoration-none ms-1">
                                                {course.instructor.username}
                                            </Link>
                                        </div>
                                    </td>

                                    {/* Enrolled */}
                                    <td className="text-center">
                                        <span className="d-inline-block py-1 px-3 rounded-pill bg-light bg-opacity-50 small fw-bold">
                                            <i className="fas fa-users me-1 opacity-50"></i> {course.total_enrollments}
                                        </span>
                                    </td>
                                    {/* Price */}
                                    <td className="text-center">
                                        {course.price > 0 ? (
                                            <span className="fw-bold">${course.price}</span>
                                        ) : (
                                            <Badge bg="success" className="bg-opacity-25 text-success border border-success border-opacity-25">Free</Badge>
                                        )}
                                    </td>

                                    {/* Status */}
                                    <td className="text-center">
                                        <div className="d-flex align-items-center justify-content-center gap-2">
                                            <span className={`p-1 rounded-circle ${course.is_active ? 'bg-success' : 'bg-secondary'}`}></span>
                                            <span className="small fw-semibold">{course.is_active ? 'Active' : 'Draft'}</span>
                                        </div>
                                    </td>

                                    {/* Actions (Fixed!) */}
                                    <td className="text-end pe-4">
                                        <div className="d-flex justify-content-end">
                                            {/* زر المشاهدة */}
                                            <Link to={`/course/${course.id}`} className="action-btn text-primary" title="View">
                                                <i className="fas fa-eye"></i>
                                            </Link>

                                            {/* زر التعديل (مسار الأدمن) */}
                                            <Link to={`/admin/edit-course/${course.id}`} className="action-btn text-warning" title="Edit">
                                                <i class="fas fa-pen"></i>
                                            </Link>

                                            {/* زر الحذف */}
                                            <button onClick={() => handleDeleteCourse(course.id)} className="action-btn text-danger" title="Delete">
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </div>
                                    </td>

                                </tr>
                            ))
                        ) : (
                            <tr><td colspan="6" class="text-center py-5 opacity-50">No courses found.</td></tr>
                        )}
                    </tbody>
                </Table>
            </Card>
        </Container>
    )
}

export default AdminDashboard