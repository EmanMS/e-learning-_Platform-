import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { Container, Card, Row, Col, Badge, Spinner, Table } from 'react-bootstrap'

function AdminInstructorDetail() {
    const { id } = useParams()
    const [instructor, setInstructor] = useState(null)
    const token = localStorage.getItem('token')

    useEffect(() => {
        axios.get(`http://127.0.0.1:8000/api/admin/instructor/${id}/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => setInstructor(res.data))
    }, [id])

    if (!instructor) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>

    return (
        <Container className="py-5">
            <Link to="/admin/instructors" className="btn btn-light mb-4 border">← Back to Instructors</Link>
            
            <Row>
                <Col md={4}>
                    <Card className="border-0 shadow-sm rounded-4 text-center p-4">
                        <div className="mx-auto mb-3">
                            {instructor.profile_picture ? (
                                <img src={instructor.profile_picture} className="rounded-circle shadow-sm" style={{width: '120px', height:'120px', objectFit:'cover'}} />
                            ) : (
                                <div className="bg-info text-white rounded-circle d-flex align-items-center justify-content-center mx-auto" style={{width:'100px', height:'100px', fontSize:'2.5rem'}}>
                                    {instructor.username.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <h4>{instructor.username}</h4>
                        <p className="text-muted">{instructor.specialization}</p>
                        <p className="small text-muted">{instructor.email}</p>
                        <div className="d-flex justify-content-around mt-4">
                            <div><h5>{instructor.courses_count}</h5><small>Courses</small></div>
                            <div><h5>{instructor.total_students}</h5><small>Students</small></div>
                        </div>
                    </Card>
                </Col>

                <Col md={8}>
                    <Card className="border-0 shadow-sm rounded-4">
                        <Card.Header className="bg-white border-0 py-3">
                            <h5 className="mb-0 fw-bold">Created Courses</h5>
                        </Card.Header>
                        <Table hover responsive className="mb-0">
                            <thead className="bg-light">
                                <tr><th>Title</th><th>Price</th><th>Category</th></tr>
                            </thead>
                            <tbody>
                                {instructor.courses.map(course => (
                                    <tr key={course.id}>
                                        <td className="fw-bold">{course.title}</td>
                                        <td className="text-success">${course.price}</td>
                                        <td><Badge bg="light" text="dark" className="border">{course.category}</Badge></td>
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
export default AdminInstructorDetail