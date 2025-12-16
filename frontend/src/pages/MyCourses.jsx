import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap'

function MyCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // 1. نجيب التذكرة من الحفظ
    const token = localStorage.getItem('token')

    // لو مفيش تذكرة، يبقى اليوزر مش مسجل، نوديه اللوجين
    if (!token) {
      navigate('/login')
      return
    }

    // 2. نكلم الباك إند ونبعت التذكرة
    axios.get('http://127.0.0.1:8000/api/my-courses/', {
      headers: {
        'Authorization': `Bearer ${token}` // 🔑 السر هنا
      }
    })
      .then(res => {
        setCourses(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError('Failed to fetch your courses. Please login again.')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    )
  }

  return (
    <Container className="py-5">
      <h2 className="fw-bold mb-4">📚 My Learning</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {courses.length > 0 ? (
        <Row xs={1} md={2} lg={3} className="g-4">
          {courses.map(course => (
            <Col key={course.id}>
              <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="position-relative">
                  {course.thumbnail ? (
                    <Card.Img variant="top" src={course.thumbnail?.startsWith('http') ? course.thumbnail : `http://127.0.0.1:8000${course.thumbnail}`}
                      style={{ height: '180px', objectFit: 'cover' }} />
                  ) : (
                    <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '180px' }}>
                      <i className="fas fa-book-reader fa-3x text-muted opacity-50"></i>
                    </div>
                  )}
                  <Badge bg="success" className="position-absolute top-0 end-0 m-3 shadow-sm px-3">
                    Enrolled
                  </Badge>
                </div>

                <Card.Body className="d-flex flex-column p-4">
                  <Card.Title as="h5" className="fw-bold mb-2">{course.title}</Card.Title>
                  <div className="mt-auto">
                    <Link to={`/course/${course.id}`}>
                      <Button variant="primary" className="w-100 rounded-pill fw-bold">
                        Continue Learning
                      </Button>
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div className="text-center py-5">
          <h4 className="text-muted">You haven't enrolled in any courses yet.</h4>
          <Link to="/" className="btn btn-outline-primary mt-3 px-4 rounded-pill">Browse Courses</Link>
        </div>
      )}
    </Container>
  )
}

export default MyCourses