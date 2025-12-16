import { useEffect, useState } from 'react'
import axios from 'axios'
import { Container, Card, Table, Badge, Button, Spinner } from 'react-bootstrap'
import { Link } from 'react-router-dom'

function InstructorStudents() {
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const token = localStorage.getItem('token')

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/instructor/students/', {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => {
            setStudents(res.data)
            setLoading(false)
        })
    }, [])

    if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>

    return (
        <Container className="py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold"><i class="fas fa-users text-primary me-2"></i> My Students</h2>
                <Link to="/instructor/dashboard" className="btn btn-light rounded-pill border">Back to Dashboard</Link>
            </div>

            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <Table hover responsive className="mb-0 align-middle">
                    <thead className="bg-light">
                        <tr>
                            <th className="ps-4">Student Name</th>
                            <th>Enrolled Courses</th>
                            <th>Date Joined</th>
                            <th className="text-end pe-4">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.id}>
                                <td className="ps-4">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3 fw-bold" style={{ width: '40px', height: '40px' }}>
                                            {student.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <Link to={`/student/${student.id}`} className="fw-bold text-dark text-decoration-none">
                                                {student.name}
                                            </Link>                                            <small className="text-muted">{student.email}</small>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    {student.courses.map((c, i) => (
                                        <Badge key={i} bg="light" text="dark" className="border me-1 mb-1">{c}</Badge>
                                    ))}
                                </td>
                                <td className="text-muted small">
                                    {new Date(student.date_joined).toLocaleDateString()}
                                </td>
                                <td className="text-end pe-4">
                                    <Button variant="outline-primary" size="sm" title="View Progress (Coming Soon)">
                                        <i className="fas fa-chart-line"></i>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {students.length === 0 && <tr><td colSpan="4" className="text-center py-5">No students yet.</td></tr>}
                    </tbody>
                </Table>
            </Card>
        </Container>
    )
}
export default InstructorStudents