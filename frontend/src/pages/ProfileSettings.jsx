import { useState, useEffect } from 'react'
import axios from 'axios'
import { Container, Row, Col, Card, Form, Button, Image, Badge, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2' 

function ProfileSettings() {
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('general')
    const [passwords, setPasswords] = useState({ new: '', confirm: '' })
    const [preview, setPreview] = useState(null)
    const [imageFile, setImageFile] = useState(null)
    const [error, setError] = useState('')

    const navigate = useNavigate()
    const token = localStorage.getItem('token')

    useEffect(() => {
        if (!token) { navigate('/login'); return; }

        axios.get('http://127.0.0.1:8000/api/profile/', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => {
            setUserData(res.data)
            setPreview(res.data.profile_picture)
            setLoading(false)
        })
        .catch(err => {
            console.error(err)
            setError('Failed to load profile data.')
            setLoading(false)
        })
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (activeTab === 'security') {
            if (passwords.new !== passwords.confirm) {
                return Swal.fire('Error', 'Passwords do not match', 'error')
            }
        }

        const formData = new FormData()
        formData.append('first_name', userData.first_name)
        formData.append('last_name', userData.last_name)
        formData.append('email', userData.email)
        
        if (userData.role === 'instructor') {
            formData.append('bio', userData.bio || '')
            formData.append('specialization', userData.specialization || '')
        }

        if (imageFile) {
            formData.append('profile_picture', imageFile)
        }
        
        if (activeTab === 'security' && passwords.new) {
            formData.append('new_password', passwords.new)
        }

        try {
            await axios.put('http://127.0.0.1:8000/api/profile/', formData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            })
            
            Swal.fire('Success', 'Profile updated successfully!', 'success')
            
            if (activeTab === 'security') {
                localStorage.clear()
                window.location.href = '/login'
            } else {
                // تحديث بسيط للصورة في النافبار (اختياري)
                if (userData.first_name) localStorage.setItem('username', userData.first_name)
                window.location.reload()
            }
        } catch (err) {
            console.error(err)
            Swal.fire('Error', 'Something went wrong', 'error')
        }
    }

    // Skeleton Loader (عشان تحسي بالفرق في التحميل)
    if (loading) {
        return (
            <Container className="py-5 animate-pulse">
                <Row>
                    <Col md={3}>
                        <div className="skeleton-box" style={{height: '250px'}}></div>
                    </Col>
                    <Col md={9}>
                         <div className="skeleton-box mb-3" style={{height: '80px'}}></div>
                         <div className="skeleton-box" style={{height: '400px'}}></div>
                    </Col>
                </Row>
            </Container>
        )
    }

    // لو حصل خطأ في الجلب، نعرض رسالة بدل الشاشة البيضاء
    if (!userData) return <Container className="text-center py-5"><h3>Error loading profile</h3></Container>

    return (
        <Container className="py-5">
            <h2 className="fw-bold mb-4">⚙️ Account Settings</h2>
            {error && <Alert variant="danger">{error}</Alert>}

            <Row>
                {/* القائمة الجانبية (Tabs) */}
                <Col md={3} className="mb-4">
                    <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                        <div className="list-group list-group-flush">
                            <button 
                                className={`list-group-item list-group-item-action p-3 border-0 ${activeTab === 'general' ? 'bg-primary text-white fw-bold' : ''}`}
                                onClick={() => setActiveTab('general')}
                            >
                                👤 General Info
                            </button>
                            <button 
                                className={`list-group-item list-group-item-action p-3 border-0 ${activeTab === 'security' ? 'bg-primary text-white fw-bold' : ''}`}
                                onClick={() => setActiveTab('security')}
                            >
                                🔒 Security
                            </button>
                        </div>
                    </Card>
                </Col>

                {/* المحتوى */}
                <Col md={9}>
                    <Card className="border-0 shadow-sm rounded-4">
                        <Card.Body className="p-4">
                            <Form onSubmit={handleSubmit}>
                                
                                {/* 1. General Tab */}
                                {activeTab === 'general' && (
                                    <>
                                        {/* صورة البروفايل */}
                                        <div className="d-flex align-items-center mb-4 p-3 bg-light rounded-4 border">
                                            <div className="position-relative me-4">
                                                {preview ? (
                                                    <Image src={preview} roundedCircle style={{width: '90px', height: '90px', objectFit:'cover'}} />
                                                ) : (
                                                    <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '90px', height: '90px', fontSize: '2rem'}}>
                                                        {userData.username.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <Form.Label htmlFor="file-upload" className="position-absolute bottom-0 end-0 bg-dark text-white rounded-circle p-1 shadow" style={{cursor: 'pointer'}}>
                                                    📷
                                                </Form.Label>
                                                <input type="file" id="file-upload" style={{display:'none'}} onChange={(e) => {
                                                    const file = e.target.files[0]
                                                    if(file){
                                                        setImageFile(file)
                                                        setPreview(URL.createObjectURL(file))
                                                    }
                                                }} />
                                            </div>
                                            <div>
                                                <h5 className="mb-0 fw-bold">{userData.username}</h5>
                                                <Badge bg="info" className="text-uppercase mt-1">{userData.role}</Badge>
                                            </div>
                                        </div>

                                        <Row className="mb-3">
                                            <Col md={6}>
                                                <Form.Label className="fw-bold small">First Name</Form.Label>
                                                <Form.Control type="text" value={userData.first_name} onChange={(e) => setUserData({...userData, first_name: e.target.value})} />
                                            </Col>
                                            <Col md={6}>
                                                <Form.Label className="fw-bold small">Last Name</Form.Label>
                                                <Form.Control type="text" value={userData.last_name} onChange={(e) => setUserData({...userData, last_name: e.target.value})} />
                                            </Col>
                                        </Row>
                                        
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold small">Email</Form.Label>
                                            <Form.Control type="email" value={userData.email} onChange={(e) => setUserData({...userData, email: e.target.value})} />
                                        </Form.Group>

                                        {/* للمدربين فقط */}
                                        {userData.role === 'instructor' && (
                                            <>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-bold small">Specialization</Form.Label>
                                                    <Form.Control type="text" value={userData.specialization} onChange={(e) => setUserData({...userData, specialization: e.target.value})} />
                                                </Form.Group>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-bold small">Bio</Form.Label>
                                                    <Form.Control as="textarea" rows={3} value={userData.bio} onChange={(e) => setUserData({...userData, bio: e.target.value})} />
                                                </Form.Group>
                                            </>
                                        )}
                                    </>
                                )}

                                {/* 2. Security Tab */}
                                {activeTab === 'security' && (
                                    <div className="bg-light p-4 rounded-4">
                                        <h5 className="fw-bold mb-3">Change Password</h5>
                                        <Form.Group className="mb-3">
                                            <Form.Control type="password" placeholder="New Password" onChange={(e) => setPasswords({...passwords, new: e.target.value})} />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Control type="password" placeholder="Confirm Password" onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} />
                                        </Form.Group>
                                    </div>
                                )}

                                <div className="text-end mt-4">
                                    <Button type="submit" variant="dark" className="px-4 fw-bold rounded-pill">Save Changes</Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default ProfileSettings