import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { Container, Row, Col, Card, Badge, Spinner, Button, Image } from 'react-bootstrap'
import { motion } from 'framer-motion' // عشان الأنيميشن اللي ضفناه

function InstructorProfile() {
    const { id } = useParams()
    const [instructor, setInstructor] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get(`http://127.0.0.1:8000/api/public/instructor/${id}/`)
        .then(res => {
            setInstructor(res.data)
            setLoading(false)
        })
        .catch(err => setLoading(false))
    }, [id])

    if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>
    if (!instructor) return <div className="text-center py-5">Instructor not found</div>

    return (
        <Container className="py-5">
            {/* 1. Header Section */}
            <Card className="border-0 shadow-sm rounded-4 mb-5 overflow-hidden">
                <div className="bg-light p-5 text-center position-relative" bg-body>
                    {/* صورة المدرب */}
                    <div className="position-relative d-inline-block">
                        {instructor.profile_picture ? (
                            <Image src={instructor.profile_picture} roundedCircle thumbnail style={{width: '150px', height: '150px', objectFit: 'cover'}} />
                        ) : (
                            <div className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{width: '150px', height: '150px', fontSize: '3rem', color: '#6366f1'}}>
                                {instructor.username.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    
                    <h2 className="fw-bold mt-3 mb-1">{instructor.full_name}</h2>
                    <p className="text-primary fw-bold mb-3">{instructor.specialization}</p>
                    
                    <div className="d-flex justify-content-center gap-4 text-muted mb-4">
                        <span><i className="fas fa-book-open me-1"></i> {instructor.total_courses} Courses</span>
                        <span><i className="fas fa-users me-1"></i> {instructor.total_students} Students</span>
                    </div>

                    <p className="mx-auto text-muted" style={{maxWidth: '600px', lineHeight: '1.8'}}>
                        {instructor.bio || "This instructor hasn't added a bio yet."}
                    </p>
                </div>
            </Card>

            {/* 2. Instructor's Courses */}
            <h4 className="fw-bold mb-4 ps-2 border-start border-4 border-primary">
                &nbsp; Courses by {instructor.full_name}
            </h4>
            
            <Row xs={1} md={2} lg={3} className="g-4">
                {instructor.courses.map(course => (
                    <Col key={course.id}>
                        <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                            <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                                <Link to={`/course/${course.id}`}>
                                    <div className="position-relative">
                                        {course.thumbnail ? (
                                            <Card.Img variant="top" src={course.thumbnail} style={{ height: '180px', objectFit: 'cover' }} />
                                        ) : (
                                            <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '180px' }}><i className="fas fa-image fa-3x text-muted opacity-50"></i></div>
                                        )}
                                        <Badge bg="white" text="dark" className="position-absolute top-0 start-0 m-3 shadow-sm rounded-pill px-3">{course.category}</Badge>
                                    </div>
                                </Link>
                                <Card.Body className="d-flex flex-column p-4">
                                    <Card.Title as="h6" className="fw-bold mb-3">
                                        <Link to={`/course/${course.id}`} className="text-decoration-none text-dark">{course.title}</Link>
                                    </Card.Title>
                                    <div className="mt-auto d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0 fw-bold text-success">{course.price > 0 ? `$${course.price}` : "Free"}</h5>
                                        <Link to={`/course/${course.id}`}><Button variant="outline-primary" size="sm" className="rounded-pill px-3">View</Button></Link>
                                    </div>
                                </Card.Body>
                            </Card>
                        </motion.div>
                    </Col>
                ))}
            </Row>

            {instructor.courses.length === 0 && (
                <div className="text-center py-5 text-muted">No active courses found.</div>
            )}
        </Container>
    )
}

export default InstructorProfile