import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { Container, Row, Col, Card, Form, Button, Table, Badge, Image, Spinner } from 'react-bootstrap'
import Swal from 'sweetalert2'

function StudentDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [student, setStudent] = useState(null)
    const [loading, setLoading] = useState(true)
    
    // للتحكم في التعديل
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({})
    
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    const isAdmin = role === 'admin'

    useEffect(() => {
        fetchStudent()
    }, [id])

    const fetchStudent = () => {
        axios.get(`http://127.0.0.1:8000/api/student/${id}/manage/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => {
            setStudent(res.data)
            setFormData({
                first_name: res.data.first_name,
                last_name: res.data.last_name,
                email: res.data.email
            })
            setLoading(false)
        })
        .catch(err => {
            Swal.fire("Error", "Access Denied or Student Not Found", "error")
            navigate(-1)
        })
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        try {
            await axios.put(`http://127.0.0.1:8000/api/student/${id}/manage/`, formData, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            Swal.fire("Updated!", "Student details updated.", "success")
            setIsEditing(false)
            fetchStudent()
        } catch (err) {
            Swal.fire("Error", "Failed to update", "error")
        }
    }

    const handleDelete = () => {
        Swal.fire({
            title: 'Delete Student?',
            text: "This action is permanent!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, Delete'
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(`http://127.0.0.1:8000/api/student/${id}/manage/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).then(() => {
                    Swal.fire("Deleted!", "Student account removed.", "success")
                    navigate(-1)
                })
            }
        })
    }

    if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>

    return (
        <Container className="py-5">
            <div className="mb-4">
                <Button variant="light" onClick={() => navigate(-1)} className="rounded-pill border px-3">
                    <i className="fas fa-arrow-left me-2"></i> Back
                </Button>
            </div>

            <Row>
                {/* 1. كارت المعلومات الشخصية */}
                <Col lg={4}>
                    <Card className="border-0 shadow-sm rounded-4 text-center p-4 mb-4">
                        <div className="mx-auto mb-3">
                            {student.profile_picture ? (
                                <Image src={student.profile_picture} roundedCircle style={{width:'120px', height:'120px', objectFit:'cover'}} />
                            ) : (
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto shadow-sm" style={{width:'120px', height:'120px', fontSize:'3rem'}}>
                                    {student.username.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        
                        {!isEditing ? (
                            <>
                                <h4 className="fw-bold">{student.first_name} {student.last_name}</h4>
                                <p className="text-muted">{student.email}</p>
                                <Badge bg="success" className="bg-opacity-10 text-success mb-3">Active Student</Badge>
                                
                                {isAdmin && (
                                    <div className="d-grid gap-2">
                                        <Button variant="outline-warning" onClick={() => setIsEditing(true)}>
                                            <i className="fas fa-pen me-2"></i> Edit Details
                                        </Button>
                                        <Button variant="outline-danger" onClick={handleDelete}>
                                            <i className="fas fa-trash me-2"></i> Delete Account
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <Form onSubmit={handleUpdate}>
                                <Form.Control className="mb-2" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} placeholder="First Name" />
                                <Form.Control className="mb-2" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} placeholder="Last Name" />
                                <Form.Control className="mb-3" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Email" />
                                <div className="d-flex gap-2">
                                    <Button variant="success" type="submit" size="sm" className="w-100">Save</Button>
                                    <Button variant="secondary" size="sm" className="w-100" onClick={() => setIsEditing(false)}>Cancel</Button>
                                </div>
                            </Form>
                        )}
                        
                        <div className="mt-4 pt-3 border-top text-start">
                            <small className="text-muted d-block mb-1"><strong>Username:</strong> {student.username}</small>
                            <small className="text-muted d-block"><strong>Joined:</strong> {new Date(student.date_joined).toLocaleDateString()}</small>
                        </div>
                    </Card>
                </Col>

                {/* 2. كارت الكورسات (Enrolled Courses) */}
                <Col lg={8}>
                    <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                        <Card.Header className="bg-white border-0 py-3 px-4">
                            <h5 className="fw-bold mb-0">Enrolled Courses ({student.courses.length})</h5>
                        </Card.Header>
                        <Table hover responsive className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4">Course Title</th>
                                    <th>Progress</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {student.courses.map(course => (
                                    <tr key={course.id}>
                                        <td className="ps-4 fw-bold">
                                            <Link to={`/course/${course.id}`} className="text-decoration-none text-dark">
                                                {course.title}
                                            </Link>
                                        </td>
                                        <td style={{width: '40%'}}>
                                            <div className="d-flex align-items-center">
                                                <div className="progress flex-grow-1" style={{height:'6px'}}>
                                                    <div className="progress-bar bg-success" style={{width: `${course.progress}%`}}></div>
                                                </div>
                                                <span className="ms-2 small fw-bold">{course.progress}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <Button variant="light" size="sm" className="text-primary border" as={Link} to={`/course/${course.id}`}>
                                                <i className="fas fa-eye"></i>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {student.courses.length === 0 && <tr><td colSpan="3" className="text-center py-4 text-muted">No courses enrolled.</td></tr>}
                            </tbody>
                        </Table>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default StudentDetails