import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { Container, Row, Col, Card, Table, Badge, Spinner, Button } from 'react-bootstrap'
import Swal from 'sweetalert2'

function InstructorDashboard() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const token = localStorage.getItem('token')

    const fetchData = () => {
        axios.get('http://127.0.0.1:8000/api/instructor/dashboard/', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                setData(res.data)
                setLoading(false)
            })
            .catch(err => {
                setLoading(false)
                if (err.response?.status === 403) navigate('/')
            })
    }

    useEffect(() => {
        fetchData()
    }, [])

    const scrollToCourses = (e) => {
        e.preventDefault()
        const element = document.getElementById('my-courses-table')
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "This will delete the course permanently!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it'
        }).then((result) => {
            if (result.isConfirmed) {
                axios.post(`http://127.0.0.1:8000/api/instructor/course/${id}/delete/`, {}, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                    .then(() => {
                        Swal.fire('Deleted!', 'Course has been deleted.', 'success')
                        fetchData()
                    })
            }
        })
    }

    if (loading) return <Container className="text-center py-5"><Spinner animation="border" variant="primary" /></Container>
    if (!data) return <Container className="text-center py-5"><h3>No Data Available</h3></Container>

    return (
        <Container className="py-5">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    {/* ✅ شيلنا text-dark عشان يتلون أبيض في الدارك مود */}
                    <h2 className="fw-bold mb-1">Instructor Studio</h2>
                    <p className="text-muted mb-0">Manage your content and track performance</p>
                </div>
                <Link to="/instructor/create" className="btn btn-primary px-4 py-2 fw-bold shadow-sm" style={{ backgroundColor: '#6366f1', borderColor: '#6366f1' }}>
                    <i class="fas fa-plus-circle me-2"></i>Create New Course
                </Link>
            </div>

            {/* 1. Stats Cards */}
            <Row className="g-4 mb-4">
                
                <Col md={4}>
                    <div onClick={scrollToCourses} style={{cursor: 'pointer'}}>
                        {/* ✅ شيلنا bg-white وخليناه dashboard-card */}
                        <Card className="dashboard-card border-0 shadow-sm h-100 p-3 hover-card">
                            <div className="d-flex justify-content-between mb-3">
                                <div className="icon-box bg-primary bg-opacity-10 text-primary">
                                    <i className="fas fa-book"></i>
                                </div>
                                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill h-50">View All</span>
                            </div>
                            {/* ✅ شيلنا text-dark */}
                            <h2 className="fw-bold mb-0">{data.stats.total_courses}</h2>
                            <p className="text-muted small mb-0">My Courses</p>
                        </Card>
                    </div>
                </Col>

                <Col md={4}>
                    <Link to="/instructor/students" className="text-decoration-none">
                        <Card className="dashboard-card border-0 shadow-sm h-100 p-3 hover-card">
                            <div className="d-flex justify-content-between mb-3">
                                <div className="icon-box bg-success bg-opacity-10 text-success">
                                    <i className="fas fa-user-graduate"></i>
                                </div>
                                <span className="badge bg-success bg-opacity-10 text-success rounded-pill h-50">Details</span>
                            </div>
                            <h2 className="fw-bold mb-0">{data.stats.total_students}</h2>
                            <p className="text-muted small mb-0">Enrolled Students</p>
                        </Card>
                    </Link>
                </Col>

                <Col md={4}>
                    <Card className="dashboard-card border-0 shadow-sm h-100 p-3">
                        <div className="d-flex justify-content-between mb-3">
                            <div className="icon-box bg-warning bg-opacity-10 text-warning">
                                <i className="fas fa-dollar-sign"></i>
                            </div>
                            <span className="badge bg-warning bg-opacity-10 text-warning rounded-pill h-50">+12%</span>
                        </div>
                        <h2 className="fw-bold mb-0">${data.stats.total_revenue}</h2>
                        <p className="text-muted small mb-0">Total Revenue</p>
                    </Card>
                </Col>
            </Row>

            {/* 2. My Courses Table */}
            <div id="my-courses-table" style={{ scrollMarginTop: '100px' }}>
                <Card className="dashboard-card border-0 shadow-sm rounded-4 overflow-hidden mt-5">
                    {/* ✅ شيلنا bg-white من الهيدر */}
                    <Card.Header className="border-0 py-4 px-4 d-flex justify-content-between align-items-center" style={{backgroundColor: 'transparent'}}>
                        <div>
                            <h5 className="fw-bold mb-1">My Courses Library</h5>
                            <p className="text-muted small mb-0">Manage and update your courses</p>
                        </div>
                        <Badge bg="secondary" className="bg-opacity-10 text-secondary border px-3 py-2">{data.stats.total_courses} Courses</Badge>
                    </Card.Header>

                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-secondary small text-uppercase">
                            <tr>
                                <th className="ps-4 py-3">Course Details</th>
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
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center">
                                                <Link to={`/course/${course.id}`}>
                                                    {course.thumbnail ?
                                                        <img src={`http://127.0.0.1:8000${course.thumbnail}`}
                                                            className="rounded-3 me-3 shadow-sm hover-scale"
                                                            style={{ width: '55px', height: '55px', objectFit: 'cover' }} />
                                                        :
                                                        <div className="bg-secondary bg-opacity-10 rounded-3 me-3 d-flex align-items-center justify-content-center text-secondary border"
                                                            style={{ width: '55px', height: '55px' }}><i className="fas fa-image"></i></div>
                                                    }
                                                </Link>
                                                <div>
                                                    <Link to={`/course/${course.id}`} className="fw-bold text-decoration-none d-block mb-1 course-title-link" style={{color: 'inherit'}}>
                                                        {course.title}
                                                    </Link>
                                                    <Badge bg="secondary" className="bg-opacity-10 text-secondary border fw-normal">
                                                        {course.category}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="text-center">
                                            <span className="d-inline-block py-1 px-3 rounded-pill bg-secondary bg-opacity-10 small fw-bold">
                                                <i className="fas fa-users me-1 opacity-50"></i> {course.total_enrollments}
                                            </span>
                                        </td>

                                        <td className="text-center">
                                            {course.price > 0 ? (
                                                <span className="fw-bold text-success">${course.price}</span>
                                            ) : (
                                                <Badge bg="success" className="bg-opacity-25 text-success border border-success border-opacity-25">Free</Badge>
                                            )}
                                        </td>

                                        <td className="text-center">
                                            <div className="d-flex align-items-center justify-content-center gap-2">
                                                <span className={`p-1 rounded-circle ${course.is_active ? 'bg-success' : 'bg-secondary'}`}></span>
                                                <span className="small fw-semibold">{course.is_active ? 'Published' : 'Draft'}</span>
                                            </div>
                                        </td>

                                        <td className="text-end pe-4">
                                            <div className="d-flex justify-content-end gap-1">
                                                <Link to={`/course/${course.id}`} className="action-btn text-primary" title="View">
                                                    <i className="fas fa-eye"></i>
                                                </Link>
                                                <Link to={`/instructor/edit-course/${course.id}`} className="action-btn text-warning" title="Edit">
                                                    <i className="fas fa-pen"></i>
                                                </Link>
                                                <Link to={`/instructor/course/${course.id}/add-lesson`} className="action-btn text-success" title="Add Lesson">
                                                    <i className="fas fa-plus"></i>
                                                </Link>
                                                <button onClick={() => handleDelete(course.id)} className="action-btn text-danger" title="Delete">
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colspan="5" class="text-center py-5 opacity-50">You haven't created any courses yet.</td></tr>
                            )}
                        </tbody>
                    </Table>
                </Card>
            </div>
        </Container>
    )
}

export default InstructorDashboard