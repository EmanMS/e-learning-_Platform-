import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Container, Card, Form, Button, Row, Col, Spinner } from 'react-bootstrap'
import toast from 'react-hot-toast'

function CreateCourse() {
    const [formData, setFormData] = useState({
        title: '', description: '', price: 0, category: 'Development', is_paid: false
    })
    const [thumbnail, setThumbnail] = useState(null)
    const [loading, setLoading] = useState(false)
    
    const navigate = useNavigate()
    const token = localStorage.getItem('token')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        // ✅ استخدام FormData عشان رفع الصور
        const data = new FormData()
        data.append('title', formData.title)
        data.append('description', formData.description)
        data.append('price', formData.price)
        data.append('category', formData.category)
        data.append('is_paid', formData.is_paid) // الباك إند هيحوله لـ True/False
        if (thumbnail) data.append('thumbnail', thumbnail)

        try {
            // ✅ الرابط الصحيح حسب urls.py
            await axios.post('http://127.0.0.1:8000/api/instructor/create-course/', data, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            })
            toast.success('Course Created Successfully! 🎉')
            navigate('/instructor/dashboard')
        } catch (err) {
            console.error(err)
            toast.error(err.response?.data?.error || 'Error creating course')
            setLoading(false)
        }
    }

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card className="border-0 shadow-lg rounded-4 p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 className="fw-bold mb-0">Create New Course</h3>
                            <Button variant="light" onClick={() => navigate(-1)} className="rounded-pill">Cancel</Button>
                        </div>
                        
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold text-muted small">Course Title</Form.Label>
                                <Form.Control type="text" onChange={e => setFormData({...formData, title: e.target.value})} required className="py-2" placeholder="e.g. Master React JS" />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold text-muted small">Description</Form.Label>
                                <Form.Control as="textarea" rows={4} onChange={e => setFormData({...formData, description: e.target.value})} required className="py-2" />
                            </Form.Group>

                            <Row className="mb-3">
                                <Col>
                                    <Form.Label className="fw-bold text-muted small">Category</Form.Label>
                                    <Form.Select onChange={e => setFormData({...formData, category: e.target.value})} className="py-2">
                                        <option value="Development">Development</option>
                                        <option value="Business">Business</option>
                                        <option value="Design">Design</option>
                                        <option value="Marketing">Marketing</option>
                                    </Form.Select>
                                </Col>
                                <Col>
                                    <Form.Label className="fw-bold text-muted small">Price ($)</Form.Label>
                                    <Form.Control type="number" onChange={e => setFormData({...formData, price: e.target.value})} disabled={!formData.is_paid} className="py-2" />
                                </Col>
                            </Row>

                            <Form.Check 
                                type="switch"
                                label="Is this a paid course?"
                                className="mb-4 fw-bold"
                                onChange={e => setFormData({...formData, is_paid: e.target.checked})}
                            />

                            <Form.Group className="mb-4">
                                <Form.Label className="fw-bold text-muted small">Course Thumbnail</Form.Label>
                                <Form.Control type="file" onChange={e => setThumbnail(e.target.files[0])} />
                            </Form.Group>

                            <Button type="submit" variant="primary" className="w-100 fw-bold py-2 rounded-pill shadow-sm" disabled={loading}>
                                {loading ? <Spinner animation="border" size="sm" /> : 'Create Course'}
                            </Button>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}
export default CreateCourse