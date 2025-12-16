import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { Container, Row, Col, Form, Button, Spinner, Badge } from 'react-bootstrap'
import toast from 'react-hot-toast'

function Signup() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        account_type: 'student' // القيمة الافتراضية
    })
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSignup = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            await axios.post('http://127.0.0.1:8000/api/signup/', formData)
            toast.success('Account Created! Please Login 🚀')
            navigate('/login')
        } catch (err) {
            console.error(err)
            // عرض رسالة الخطأ القادمة من الباك إند لو موجودة
            const errorMsg = err.response?.data?.error || 'Registration failed. Try again.'
            toast.error(errorMsg)
            setLoading(false)
        }
    }

    return (
        <div className="d-flex align-items-center min-vh-100 bg-body">
            <Container fluid className="h-100">
                <Row className="h-100">
                    
                    {/* 1. الجانب الأيسر (الصورة الجذابة) */}
                    <Col md={6} className="d-none d-md-block p-0 position-relative">
                        <img 
                            src="https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=2069&auto=format&fit=crop" 
                            alt="Signup Cover" 
                            className="w-100 h-100 object-fit-cover"
                            style={{ position: 'absolute' }}
                        />
                        <div className="position-absolute top-0 start-0 w-100 h-100 bg-primary opacity-25"></div>
                        <div className="position-absolute top-0 start-0 w-100 h-100" style={{background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 100%)'}}></div>
                        
                        <div className="position-absolute bottom-0 start-0 p-5 text-white">
                            <h1 className="display-4 fw-bold">Join Our Community</h1>
                            <p className="lead opacity-75">
                                Unlock access to the best courses and mentors. Create your account today.
                            </p>
                        </div>
                    </Col>

                    {/* 2. الجانب الأيمن (فورم التسجيل) */}
                    <Col md={6} className="d-flex align-items-center justify-content-center p-5">
                        <div style={{ maxWidth: '450px', width: '100%' }}>
                            <div className="text-center mb-4">
                                <h2 className="fw-bold mb-1">Create Account</h2>
                                <p className="text-muted">It's free and only takes a minute.</p>
                            </div>

                            <Form onSubmit={handleSignup}>
                                <Row className="mb-3">
                                    <Col>
                                        <Form.Group>
                                            <Form.Label className="fw-bold small">Username</Form.Label>
                                            <Form.Control type="text" name="username" placeholder="e.g. ahmed123" onChange={handleChange} required className="bg-light border-0 py-2" />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold small">Email Address</Form.Label>
                                    <Form.Control type="email" name="email" placeholder="name@example.com" onChange={handleChange} required className="bg-light border-0 py-2" />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold small">Password</Form.Label>
                                    <Form.Control type="password" name="password" placeholder="••••••••" onChange={handleChange} required className="bg-light border-0 py-2" />
                                </Form.Group>

                                {/* اختيار نوع الحساب (Account Type) */}
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold small">I want to:</Form.Label>
                                    <div className="d-flex gap-3">
                                        <div className="form-check p-0 flex-fill">
                                            <input 
                                                type="radio" className="btn-check" name="account_type" 
                                                id="student-option" value="student" 
                                                checked={formData.account_type === 'student'} 
                                                onChange={handleChange} 
                                            />
                                            <label className="btn btn-outline-primary w-100 py-2 rounded-3 fw-bold" htmlFor="student-option">
                                                <i className="fas fa-user-graduate me-2"></i> Learn
                                            </label>
                                        </div>
                                        <div className="form-check p-0 flex-fill">
                                            <input 
                                                type="radio" className="btn-check" name="account_type" 
                                                id="instructor-option" value="instructor" 
                                                onChange={handleChange} 
                                            />
                                            <label className="btn btn-outline-warning w-100 py-2 rounded-3 fw-bold" htmlFor="instructor-option">
                                                <i className="fas fa-chalkboard-teacher me-2"></i> Teach
                                            </label>
                                        </div>
                                    </div>
                                </Form.Group>

                                <Button variant="dark" type="submit" size="lg" className="w-100 rounded-pill fw-bold shadow-sm" disabled={loading}>
                                    {loading ? <Spinner size="sm" animation="border" /> : 'Get Started'}
                                </Button>
                            </Form>

                            <div className="text-center mt-4 pt-3 border-top">
                                <p className="text-muted small">
                                    Already have an account? <Link to="/login" className="text-primary fw-bold text-decoration-none">Log in</Link>
                                </p>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default Signup