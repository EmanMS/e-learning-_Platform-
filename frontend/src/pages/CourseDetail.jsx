import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Container, Row, Col, Card, Badge, Button, ListGroup, Spinner, Form, ProgressBar } from 'react-bootstrap'
import toast from 'react-hot-toast'

function CourseDetail() {
    const { id } = useParams()
    const [course, setCourse] = useState(null)
    const [activeLesson, setActiveLesson] = useState(null)
    const [loading, setLoading] = useState(true)
    const [completedLessonIds, setCompletedLessonIds] = useState([])
    const [inWishlist, setInWishlist] = useState(false) // ✅ حالة الويشليست

    const navigate = useNavigate()
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    const username = localStorage.getItem('username')

    // ريفيو
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState("")
    const [reviewSubmitting, setReviewSubmitting] = useState(false)

    useEffect(() => {
        const config = token ? { headers: { 'Authorization': `Bearer ${token}` } } : {}
        axios.get(`http://127.0.0.1:8000/api/courses/${id}/`, config)
            .then(res => {
                setCourse(res.data)
                setInWishlist(res.data.in_wishlist) // ✅ قراءة الحالة من الباك إند
                setLoading(false)
            })
            .catch(err => setLoading(false))
    }, [id, token])

    // ✅ دالة الويشليست

    const handleWishlist = () => {
        if (!token) { navigate('/login'); return; }

        // ✅ اللوجيك الجديد: منع الأدمن والمدرب
        if (role !== 'student') {
            toast.error("Wishlist is for students only! 🎓")
            return;
        }

        axios.post(`http://127.0.0.1:8000/api/wishlist/toggle/${id}/`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                setInWishlist(!inWishlist)
                toast.success(res.data.message)
            })
    }



    const handleLessonChange = (lesson) => { setActiveLesson(lesson); window.scrollTo(0, 0); }

    const handleMarkComplete = (lessonId) => {
        axios.post(`http://127.0.0.1:8000/api/lesson/${lessonId}/complete/`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                setCourse(prev => ({ ...prev, progress: res.data.new_progress }))
                setCompletedLessonIds([...completedLessonIds, lessonId])
                toast.success("Lesson Completed! 🎉")
            })
    }

    const handleEnroll = () => {
        if (!token) { toast.error("Please login first!"); navigate('/login'); return; }

        const btn = document.getElementById('enroll-btn');
        if (btn) { btn.innerHTML = 'Processing...'; btn.disabled = true; }

        axios.post(`http://127.0.0.1:8000/api/enroll/${id}/`, {}, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => {
                if (res.data.status === 'payment_required') window.location.href = res.data.url
                else if (res.data.status === 'enrolled') {
                    toast.success("Enrolled Successfully!")
                    window.location.reload()
                } else toast(res.data.message)
            })
            .catch(() => { toast.error("Something went wrong"); if (btn) { btn.innerHTML = 'Enroll Now'; btn.disabled = false; } })
    }

    const handleReviewSubmit = (e) => {
        e.preventDefault()
        setReviewSubmitting(true)
        axios.post(`http://127.0.0.1:8000/api/course/${id}/add-review/`,
            { rating: parseInt(rating), comment },
            { headers: { 'Authorization': `Bearer ${token}` } }
        ).then(() => { toast.success('Review added!'); window.location.reload(); })
            .catch(() => { toast.error('Error adding review'); setReviewSubmitting(false); })
    }

    const handleDownloadCertificate = () => {
        const toastId = toast.loading('Generating Certificate...')
        axios.get(`http://127.0.0.1:8000/course/${id}/certificate/`, {
            headers: { 'Authorization': `Bearer ${token}` },
            responseType: 'blob',
        }).then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${course.title}_Certificate.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.dismiss(toastId)
            toast.success("Downloaded!")
        }).catch(() => toast.error("Complete the course first!"));
    }

    if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>
    if (!course) return <div className="text-center py-5">Course not found</div>

    return (
        <Container className="py-5">
            <div className="mb-4"><Link to="/" className="text-decoration-none text-muted fw-bold">← Back to Courses</Link></div>

            <Row>
                <Col lg={8}>
                    {/* Video Player */}
                    <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-black">
                        <div className="position-relative" style={{ paddingTop: '56.25%' }}>
                            {activeLesson && activeLesson.video_url ? (
                                <iframe key={activeLesson.id} src={activeLesson.video_url.replace("watch?v=", "embed/")} title={activeLesson.title}
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} allowFullScreen></iframe>
                            ) : (
                                course.thumbnail ?
                                    <img src={course.thumbnail?.startsWith('http') ? course.thumbnail : `http://127.0.0.1:8000${course.thumbnail}`}
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> :
                                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center text-white"><i className="fas fa-play-circle fa-4x"></i></div>
                            )}
                        </div>
                        {activeLesson && (
                            <Card.Footer className="bg-body p-3 d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold">{activeLesson.title}</h5>
                                {course.is_enrolled && (
                                    <Button variant="success" size="sm" onClick={() => handleMarkComplete(activeLesson.id)} disabled={completedLessonIds.includes(activeLesson.id)}>
                                        Mark Complete
                                    </Button>
                                )}
                            </Card.Footer>
                        )}
                    </Card>

                    {/* الوصف والريفيو */}
                    <div className="mb-5">
                        <h4 className="fw-bold mb-3">About this course</h4>
                        <div className="text-muted" dangerouslySetInnerHTML={{ __html: course.description }} />
                    </div>

                    <hr className="my-5" />

                    <div className="mb-5">
                        <h3 className="fw-bold mb-4">⭐ Student Reviews <span className="text-muted fs-6">({course.avg_rating || 0}/5)</span></h3>
                        <div className="mb-4">
                            {course.reviews?.length > 0 ? (
                                course.reviews.map(review => (
                                    <Card key={review.id} className="border-0 bg-body-tertiary mb-3">
                                        <Card.Body>
                                            <div className="d-flex justify-content-between">
                                                <strong>{review.user}</strong>
                                                <span className="text-warning">{"★".repeat(review.rating)}</span>
                                            </div>
                                            <p className="text-muted small mb-0">{review.comment}</p>
                                        </Card.Body>
                                    </Card>
                                ))
                            ) : (<p className="text-muted">No reviews yet.</p>)}
                        </div>

                        {course.is_enrolled && (
                            <Card className="border-0 shadow-sm p-4">
                                <h5>Write a Review</h5>
                                <Form onSubmit={handleReviewSubmit}>
                                    <Form.Select className="mb-3 w-auto" value={rating} onChange={e => setRating(e.target.value)}>
                                        <option value="5">5 Stars</option><option value="4">4 Stars</option><option value="3">3 Stars</option><option value="2">2 Stars</option><option value="1">1 Star</option>
                                    </Form.Select>
                                    <Form.Control as="textarea" rows={3} className="mb-3" placeholder="Share your experience..." value={comment} onChange={e => setComment(e.target.value)} required />
                                    <Button type="submit" variant="dark" disabled={reviewSubmitting}>Submit Review</Button>
                                </Form>
                            </Card>
                        )}
                    </div>
                </Col>

                {/* Sidebar */}
                {/* العمود الأيمن: التحكم والقائمة */}
                {/* العمود الأيمن: التحكم والقائمة */}
                <Col lg={4}>
                    <Card className="border-0 shadow-sm rounded-4 mb-4">
                        <Card.Body className="p-4">

                            {/* ✅ الهيدر (التصنيف + زر الويشليست) */}
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <Badge bg="primary" className="mb-2 px-3 py-2 rounded-pill bg-opacity-10 text-primary">
                                    {course.category}
                                </Badge>

                                {/* ❤️ زر الويشليست (تم التصحيح والربط) */}
                                <Button
                                    variant="link"
                                    className="p-0 text-decoration-none shadow-none"
                                    onClick={handleWishlist}
                                    style={{ transition: 'transform 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <i className={`fa-heart fa-2x ${inWishlist ? 'fas text-danger' : 'far text-secondary'}`}></i>
                                </Button>
                            </div>

                            <h3 className="fw-bold mb-3">{course.title}</h3>

                            <div className="d-flex justify-content-between align-items-center mb-4 text-muted">
                                <Link to={`/instructor/${course.instructor.id}`} className="fw-bold text-primary text-decoration-none ms-1">
                                    {course.instructor.username}
                                </Link>                                <span className="fw-bold text-success fs-5">
                                    {course.price > 0 ? `$${course.price}` : 'FREE'}
                                </span>
                            </div>

                            {/* باقي الأزرار (تعديل / شراء) */}
                            {(username === course.instructor.username || role === 'admin') ? (
                                <div className="d-grid gap-2">
                                    <div className="alert alert-info border-0 py-2 small text-center mb-2">
                                        <i class="fas fa-user-shield me-1"></i> You manage this course
                                    </div>
                                    <Link to={role === 'admin' ? `/admin/edit-course/${course.id}` : `/instructor/edit-course/${course.id}`} className="btn btn-warning fw-bold shadow-sm">
                                        <i class="fas fa-pen me-2"></i> Edit Course
                                    </Link>
                                    <Link to={role === 'admin' ? `/admin/course/${course.id}/add-lesson` : `/instructor/course/${course.id}/add-lesson`} className="btn btn-outline-success fw-bold shadow-sm">
                                        <i class="fas fa-plus me-2"></i> Add Lesson
                                    </Link>
                                </div>
                            ) : role === 'instructor' ? (
                                <div className="d-grid">
                                    <Button variant="outline-primary" disabled>Instructor View Only</Button>
                                </div>
                            ) : course.is_enrolled ? (
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between small mb-1">
                                        <span className="fw-bold text-dark">Progress</span>
                                        <span className="fw-bold text-primary">{course.progress}%</span>
                                    </div>
                                    <ProgressBar now={course.progress} variant="success" style={{ height: '8px' }} />
                                    {course.progress === 100 ? (
                                        <Button variant="warning" onClick={handleDownloadCertificate} className="w-100 mt-3 fw-bold text-dark shadow-sm">
                                            <i class="fas fa-certificate me-2"></i> Certificate
                                        </Button>
                                    ) : (
                                        <Button variant="success" size="lg" className="w-100 mt-3 rounded-pill fw-bold shadow-sm" disabled>
                                            <i class="fas fa-check-circle me-2"></i> Enrolled
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <Button id="enroll-btn" onClick={handleEnroll} variant="primary" size="lg" className="w-100 rounded-pill fw-bold shadow-sm">
                                    {course.price > 0 ? 'Buy Now' : 'Enroll Now'}
                                </Button>
                            )}
                        </Card.Body>
                    </Card>

                    {/* قائمة الدروس */}
                    <h5 className="fw-bold px-1 mb-3">Course Content</h5>
                    <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                        <ListGroup variant="flush">
                            {course.lessons && course.lessons.length > 0 ? (
                                course.lessons.map((lesson) => {
                                    const isLocked = !course.is_enrolled && role !== 'instructor' && role !== 'admin';
                                    return (
                                        <ListGroup.Item
                                            key={lesson.id}
                                            action
                                            onClick={() => !isLocked ? handleLessonChange(lesson) : toast.error("Please enroll to unlock!")}
                                            active={activeLesson?.id === lesson.id}
                                            className="d-flex justify-content-between align-items-center py-3"
                                            style={{
                                                cursor: isLocked ? 'not-allowed' : 'pointer',
                                                borderLeft: activeLesson?.id === lesson.id ? '4px solid white' : 'none',
                                                opacity: isLocked ? 0.6 : 1
                                            }}
                                        >
                                            <div className="d-flex align-items-center">
                                                <span className={`me-3 fw-bold ${activeLesson?.id === lesson.id ? 'text-white' : 'text-muted'}`} style={{ minWidth: '20px' }}>
                                                    {lesson.order}
                                                </span>
                                                <span className="fw-semibold">{lesson.title}</span>
                                            </div>
                                            <i className={`fas ${activeLesson?.id === lesson.id ? 'fa-play-circle text-white' :
                                                (isLocked ? 'fa-lock text-secondary' : 'fa-play-circle text-primary')
                                                }`}></i>
                                        </ListGroup.Item>
                                    )
                                })
                            ) : (
                                <div className="p-4 text-center text-muted">No lessons added yet.</div>
                            )}
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}
export default CourseDetail