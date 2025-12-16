import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { Container, Card, Form, Button, Spinner, Row, Col } from 'react-bootstrap'
import toast from 'react-hot-toast'

function AdminEditStudent() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [studentData, setStudentData] = useState({
        username: '', first_name: '', last_name: '', email: ''
    })
    
    const token = localStorage.getItem('token')

    useEffect(() => {
        axios.get(`http://127.0.0.1:8000/api/admin/student/edit/${id}/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => {
            setStudentData(res.data)
            setLoading(false)
        })
        .catch(() => {
            toast.error("Error loading student data")
            navigate('/admin/students')
        })
    }, [id])

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await axios.put(`http://127.0.0.1:8000/api/admin/student/edit/${id}/`, studentData, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            toast.success("Student Updated Successfully! ✅")
            navigate('/admin/students')
        } catch (err) {
            toast.error("Failed to update student")
        }
    }

    if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card className="border-0 shadow-sm rounded-4">
                        <Card.Header className="bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold mb-0">Edit Student: <span className="text-primary">{studentData.username}</span></h5>
                            <Link to="/admin/students" className="btn btn-light rounded-pill border btn-sm">Cancel</Link>
                        </Card.Header>
                        
                        <Card.Body className="p-4">
                            <Form onSubmit={handleSubmit}>
                                <Row className="mb-3">
                                    <Col>
                                        <Form.Label className="small fw-bold text-muted">First Name</Form.Label>
                                        <Form.Control type="text" value={studentData.first_name} onChange={e => setStudentData({...studentData, first_name: e.target.value})} />
                                    </Col>
                                    <Col>
                                        <Form.Label className="small fw-bold text-muted">Last Name</Form.Label>
                                        <Form.Control type="text" value={studentData.last_name} onChange={e => setStudentData({...studentData, last_name: e.target.value})} />
                                    </Col>
                                </Row>

                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold text-muted">Email Address</Form.Label>
                                    <Form.Control type="email" value={studentData.email} onChange={e => setStudentData({...studentData, email: e.target.value})} required />
                                </Form.Group>

                                <div className="d-grid">
                                    <Button type="submit" variant="warning" className="fw-bold shadow-sm">
                                        Update Student Details
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}
export default AdminEditStudent