import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { Container, Card, Form, Button, Row, Col } from 'react-bootstrap'

function AddLesson() {
    const { courseId } = useParams() // بنجيب رقم الكورس من الرابط
    const [formData, setFormData] = useState({ title: '', content: '', video_url: '' })
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const token = localStorage.getItem('token')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        
        try {
            // نستخدم نفس API الأدمن اللي بيقبل إضافة درس
            // تأكدي إن الرابط ده مطابق للـ urls.py
            await axios.post(`http://127.0.0.1:8000/api/instructor/course/${courseId}/add-lesson/`, formData, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            alert('Lesson Added Successfully! 🎉')
            // نرجع لصفحة الداشبورد أو تفاصيل الكورس
            navigate('/instructor/dashboard')
        } catch (err) {
            console.error(err)
            alert('Error adding lesson')
            setLoading(false)
        }
    }

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card className="border-0 shadow-sm rounded-4 p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 className="fw-bold mb-0">Add New Lesson</h3>
                            <Link to="/instructor/dashboard" className="btn btn-light btn-sm rounded-pill">Cancel</Link>
                        </div>

                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold small">Lesson Title</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    placeholder="e.g. Introduction to Python"
                                    onChange={e => setFormData({...formData, title: e.target.value})} 
                                    required 
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold small">Video URL (Youtube)</Form.Label>
                                <Form.Control 
                                    type="url" 
                                    placeholder="https://youtube.com/..."
                                    onChange={e => setFormData({...formData, video_url: e.target.value})} 
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="fw-bold small">Content / Notes</Form.Label>
                                <Form.Control 
                                    as="textarea" 
                                    rows={5} 
                                    onChange={e => setFormData({...formData, content: e.target.value})} 
                                />
                            </Form.Group>

                            <Button type="submit" variant="primary" className="w-100 fw-bold" disabled={loading}>
                                {loading ? 'Adding Lesson...' : 'Add Lesson'}
                            </Button>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}
export default AddLesson