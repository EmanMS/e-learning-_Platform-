import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { Container, Row, Col, Card, Button, Badge, Form } from 'react-bootstrap'
import { motion } from 'framer-motion'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import PageTransition from '../components/PageTransition'
import ScrollToTop from '../components/ScrollToTop'


function Home() {
  const [courses, setCourses] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const token = localStorage.getItem('token')

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/courses/')
      .then(res => {
        setCourses(res.data)
        setFilteredCourses(res.data)
        setLoading(false)
      })
      .catch(err => setLoading(false))
  }, [])

  useEffect(() => {
    let result = courses
    if (category !== 'All') {
      result = result.filter(c => c.category === category)
    }
    if (search) {
      result = result.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.instructor?.username?.toLowerCase().includes(search.toLowerCase()) // حماية ؟
      )
    }
    setFilteredCourses(result)
  }, [search, category, courses])

  // إعدادات الحركة
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center mb-5"><Skeleton width={300} height={40} /></div>
        <Row xs={1} md={2} lg={3} className="g-4">
          {[1, 2, 3].map(n => (
            <Col key={n}><Skeleton height={300} style={{ borderRadius: 16 }} /></Col>
          ))}
        </Row>
      </Container>
    )
  }

  return (
    <PageTransition>
      <div style={{minHeight: '100vh'}}>
      
        {/* 1. Hero Section (الديناميكي) */}
        {/* شيلنا الألوان الثابتة واعتمدنا على CSS */}
        <div className="hero-section-bg p-5 mb-5 shadow-lg">
          <div className="hero-overlay"></div>

          <Row className="align-items-center hero-content py-4">
            <Col lg={7}>
              <Badge bg="warning" text="dark" className="mb-3 px-3 py-2 rounded-pill fw-bold">
                🚀 Start Learning Today
              </Badge>
              <h1 className="display-4 fw-bolder mb-3 text-white lh-tight">
                Master Future Skills <br /> with <span className="text-warning">Expert Mentors</span>
              </h1>
              <p className="lead text-light mb-4 opacity-75">
                Access 2000+ courses in coding, design, business and more. Learn at your own pace.
              </p>

              <div className="d-flex gap-3">
                {token ? (
                  <a href="#courses-section" className="btn btn-primary btn-lg rounded-pill px-5 shadow fw-bold border-0">
                    Explore Courses
                  </a>
                ) : (
                  <Link to="/signup" className="btn btn-primary btn-lg rounded-pill px-5 shadow fw-bold border-0">
                    Get Started
                  </Link>
                )}
                
                {/* زرار أبيض شفاف */}
                <a href="#courses-section" className="btn btn-outline-light btn-lg rounded-pill px-4 fw-bold">
                   View Catalog
                </a>
              </div>
            </Col>
          </Row>
        </div>

        <Container className="pb-5">
            {/* 2. Search Section */}
            <div className="row mb-5" id="courses-section" style={{ scrollMarginTop: '100px' }}>
              <div className="col-lg-8 mx-auto">
                {/* شيلنا bg-white واستخدمنا dashboard-card من الـ CSS */}
                <div className="dashboard-card p-2 rounded-pill shadow-sm d-flex gap-2 border">
                  <Form.Select
                    className="border-0 rounded-pill fw-bold"
                    style={{ width: '180px', backgroundColor: 'transparent', color: 'inherit' }}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="All">All Categories</option>
                    <option value="Development">Development</option>
                    <option value="Business">Business</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                  </Form.Select>

                  <Form.Control
                    type="text"
                    placeholder="Search courses..."
                    className="border-0 shadow-none"
                    style={{ backgroundColor: 'transparent', color: 'inherit' }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  
                  <Button variant="primary" className="rounded-circle d-flex align-items-center justify-content-center" style={{width:'40px', height:'40px', padding:0}}>
                    <i className="fas fa-search"></i>
                  </Button>
                </div>
              </div>
            </div>

            {/* 3. Courses Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="row g-4 row-cols-1 row-cols-md-2 row-cols-lg-3"
            >
              {filteredCourses.map(course => (
                <motion.div key={course.id} variants={itemVariants} className="col">
                  <Card className="h-100 dashboard-card border-0 shadow-sm rounded-4 overflow-hidden hover-card">
                    <Link to={`/course/${course.id}`}>
                      <div className="card-img-wrapper">
                        {course.thumbnail ? (
                          <Card.Img
                            variant="top"
                            src={course.thumbnail.startsWith('http') ? course.thumbnail : `http://127.0.0.1:8000${course.thumbnail}`}
                            className="card-img-custom"
                            loading="lazy"
                          />
                        ) : (
                          <div className="bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center h-100">
                            <i className="fas fa-image fa-3x text-muted opacity-50"></i>
                          </div>
                        )}

                        <span className="category-badge">
                          {course.category}
                        </span>
                      </div>
                    </Link>

                    <Card.Body className="d-flex flex-column p-4">
                      <Card.Title as="h5" className="fw-bold mb-2">
                        <Link to={`/course/${course.id}`} className="text-decoration-none text-reset">
                          {course.title.length > 50 ? course.title.substring(0, 50) + "..." : course.title}
                        </Link>
                      </Card.Title>

                      <Card.Text className="text-muted small mb-4">
                         <i className="fas fa-chalkboard-teacher me-1 text-primary"></i>
                         {/* ✅ حماية الاسم لو مش موجود، ورابط للمدرب */}
                         <Link to={`/instructor/${course.instructor?.id}`} className="fw-bold text-primary text-decoration-none ms-1">
                            {course.instructor?.username || "Unknown"}
                         </Link>            
                      </Card.Text>

                      <div className="mt-auto d-flex justify-content-between align-items-center border-top pt-3" style={{borderColor: 'var(--border-color)'}}>
                        <h5 className="mb-0 fw-bold text-success">
                          {course.price > 0 ? `$${course.price}` : "Free"}
                        </h5>
                        <Link to={`/course/${course.id}`}>
                          <Button variant="outline-primary" className="rounded-pill px-4 fw-bold btn-sm border-2">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-5 text-muted">
                <h4>No courses found matching your search.</h4>
              </div>
            )}
        </Container>
      </div>
    </PageTransition>
  )
}
export default Home