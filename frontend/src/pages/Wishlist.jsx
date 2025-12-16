import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap'

function Wishlist() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) { navigate('/login'); return; }

    // ✅✅ التصحيح: الرابط لازم يكون دقيق
    axios.get('http://127.0.0.1:8000/api/wishlist/', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        setCourses(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        // لو مفيش كورسات او حصل ايرور، مش لازم نعرض ايرور احمر يخض
        setLoading(false) 
      })
  }, [])

  if (loading) return <Container className="text-center py-5"><Spinner animation="border" /></Container>

  return (
    <Container className="py-5">
      <div className="d-flex align-items-center mb-4">
          <h2 className="fw-bold mb-0 text-dark">❤️ My Wishlist</h2>
          <span className="badge bg-danger bg-opacity-10 text-danger ms-3 rounded-pill">
              {courses.length} Items
          </span>
      </div>

      {courses.length > 0 ? (
        <Row xs={1} md={2} lg={3} className="g-4">
            {courses.map(course => (
            <Col key={course.id}>
                <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden hover-card">
                <Link to={`/course/${course.id}`}>
                    <div className="position-relative">
                        {course.thumbnail ? (
                            <Card.Img variant="top" src={`http://127.0.0.1:8000${course.thumbnail}`} style={{ height: '180px', objectFit: 'cover' }} />
                        ) : (
                            <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '180px' }}><i className="fas fa-image fa-3x text-muted opacity-50"></i></div>
                        )}
                    </div>
                </Link>

                <Card.Body className="d-flex flex-column p-4">
                    <Card.Title as="h6" className="fw-bold mb-2">
                        <Link to={`/course/${course.id}`} className="text-decoration-none text-dark">{course.title}</Link>
                    </Card.Title>
                    <div className="mt-auto d-flex justify-content-between align-items-center">
                        <span className="fw-bold text-success">${course.price}</span>
                        <Link to={`/course/${course.id}`}>
                            <Button variant="outline-primary" size="sm" className="rounded-pill px-3">View</Button>
                        </Link>
                    </div>
                </Card.Body>
                </Card>
            </Col>
            ))}
        </Row>
      ) : (
        <div className="text-center py-5">
            <div className="mb-3 text-muted opacity-25"><i className="far fa-heart fa-4x"></i></div>
            <h4 className="text-muted">Your wishlist is empty.</h4>
            <Link to="/" className="btn btn-primary mt-3 px-4 rounded-pill">Explore Courses</Link>
        </div>
      )}
    </Container>
  )
}

export default Wishlist