import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { Container, Card, Row, Col, Badge, Spinner, Table } from 'react-bootstrap'

function AdminStudentDetail() {
    const { id } = useParams()
    const [student, setStudent] = useState(null)
    const token = localStorage.getItem('token')

    useEffect(() => {
        axios.get(`http://127.0.0.1:8000/api/admin/student/${id}/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => setStudent(res.data))
        .catch(err => console.error(err))
    }, [id])

    if (!student) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>

    return (
        <Container className="py-5">
            <Link to="/admin/students" className="btn btn-light mb-4 border">← Back to Students</Link>
            
            <Row>
                {/* كارت المعلومات الشخصية */}
                <Col md={4}>
                    <Card className="border-0 shadow-sm rounded-4 text-center p-4">
                        <div className="mx-auto mb-3">
                            {student.profile_picture ? (
                                <img src={student.profile_picture} className="rounded-circle shadow-sm" style={{width: '120px', height:'120px', objectFit:'cover'}} />
                            ) : (
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto" style={{width:'100px', height:'100px', fontSize:'2.5rem'}}>
                                    {student.username.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <h4>{student.username}</h4>
                        <p className="text-muted">{student.email}</p>
                        <hr />
                        <div className="text-start">
                            <p><strong>Joined:</strong> {new Date(student.date_joined).toLocaleDateString()}</p>
                            <p><strong>Status:</strong> <Badge bg="success">Active</Badge></p>
                        </div>
                    </Card>
                </Col>

                {/* كارت الكورسات */}
                <Col md={8}>
                    <Card className="border-0 shadow-sm rounded-4">
                        <Card.Header className="bg-white border-0 py-3">
                            <h5 className="mb-0 fw-bold">Enrolled Courses ({student.enrolled_courses.length})</h5>
                        </Card.Header>
                        <Table hover responsive className="mb-0">
                            <thead className="bg-light">
                                <tr><th>Course</th><th>Category</th><th>Progress</th></tr>
                            </thead>
                            <tbody>
                                {student.enrolled_courses.map((course, idx) => (
                                    <tr key={idx}>
                                        <td className="fw-bold">{course.title}</td>
                                        <td><Badge bg="light" text="dark" className="border">{course.category}</Badge></td>
                                        <td>
                                            <div className="progress" style={{height:'6px', width:'100px'}}>
                                                <div className="progress-bar bg-success" style={{width: `${course.progress}%`}}></div>
                                            </div>
                                            <small>{course.progress}%</small>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}
export default AdminStudentDetail