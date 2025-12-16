import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const resToken = await axios.post('http://127.0.0.1:8000/api/token/', { username, password })
      localStorage.setItem('token', resToken.data.access)

      const resProfile = await axios.get('http://127.0.0.1:8000/api/profile/', {
        headers: { 'Authorization': `Bearer ${resToken.data.access}` }
      })

      localStorage.setItem('role', resProfile.data.role)
      localStorage.setItem('username', username)

      toast.success(`Welcome back, ${username}! 👋`)

      // توجيه ذكي
      if (resProfile.data.role === 'admin') window.location.href = "/dashboard/admin"
      else if (resProfile.data.role === 'instructor') window.location.href = "/instructor/dashboard"
      else window.location.href = "/"

    } catch (err) {
      toast.error('Invalid Username or Password')
      setLoading(false)
    }
  }

  return (
    <div className="d-flex align-items-center min-vh-100 bg-body">
      <Container fluid className="h-100">
        <Row className="h-100">

          {/* 1. الجانب الأيسر (الصورة) - يختفي في الموبايل */}
          <Col md={6} className="d-none d-md-block p-0 position-relative">
            <img
              src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2256&auto=format&fit=crop"
              alt="Login Cover"
              className="w-100 h-100 object-fit-cover"
              style={{ position: 'absolute' }}
            />
            <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-25"></div>
            <div className="position-absolute bottom-0 start-0 p-5 text-white">
              <h1 className="display-4 fw-bold">Learn without limits</h1>
              <p className="lead">Join thousands of students and start your journey today.</p>
            </div>
          </Col>

          {/* 2. الجانب الأيمن (الفورم) */}
          <Col md={6} className="d-flex align-items-center justify-content-center p-5">
            <div style={{ maxWidth: '400px', width: '100%' }}>
              <div className="text-center mb-5">
                <i className="fas fa-graduation-cap text-primary fa-3x mb-3"></i>
                <h2 className="fw-bold">Welcome Back</h2>
                <p className="text-muted">Please enter your details to sign in.</p>
              </div>

              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small">Username</Form.Label>
                  <Form.Control
                    size="lg"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="bg-light border-0"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold small">Password</Form.Label>
                  <Form.Control
                    size="lg"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-light border-0"
                  />
                </Form.Group>

                <motion.button
                  whileHover={{ scale: 1.05 }} // يكبر سنة لما تقفي عليه
                  whileTap={{ scale: 0.95 }}   // يصغر سنة لما تدوسي (كأنك ضغتيه)
                  className="btn btn-primary w-100 rounded-pill fw-bold shadow-sm"
                  type="submit"
                >
                  Login
                </motion.button>
              </Form>

              <div className="text-center mt-4 text-muted">
                Don't have an account? <Link to="/signup" className="text-primary fw-bold text-decoration-none">Sign up for free</Link>
              </div>
            </div>
          </Col>

        </Row>
      </Container>
    </div>
  )
}

export default Login