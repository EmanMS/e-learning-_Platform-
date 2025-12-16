import { Form, Button, Row, Col, Card, Table, Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useState } from 'react'

const EditCourseForm = ({ course, setCourse, handleSubmit, loading, role }) => {
    // role: 'admin' or 'instructor'
    
    // دالة لتغيير الحالة
    const handleStatusChange = (e) => {
        setCourse({ ...course, is_active: e.target.checked })
    }

    return (
        <>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">
                    <i className="fas fa-cog text-warning me-2"></i>Edit Course Settings
                </h4>
                <Link to={role === 'admin' ? "/dashboard/admin" : "/instructor/dashboard"} className="btn btn-light btn-sm border rounded-pill px-3">
                    <i className="fas fa-arrow-left me-1"></i> Back
                </Link>
            </div>

            {/* 1. Main Settings Card */}
            <Card className="border-0 shadow-sm rounded-4 mb-5">
                <Card.Body className="p-4">
                    <Form onSubmit={handleSubmit}>
                        <Row className="mb-3">
                            <Col md={8}>
                                <Form.Group>
                                    <Form.Label className="fw-bold small text-muted">Title</Form.Label>
                                    <Form.Control type="text" value={course.title} onChange={e => setCourse({...course, title: e.target.value})} className="py-2" />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="fw-bold small text-muted">Category</Form.Label>
                                    <Form.Select value={course.category} onChange={e => setCourse({...course, category: e.target.value})} className="py-2">
                                        <option value="Development">Development</option>
                                        <option value="Business">Business</option>
                                        <option value="Design">Design</option>
                                        <option value="Marketing">Marketing</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold small text-muted">Description</Form.Label>
                            <Form.Control as="textarea" rows={4} value={course.description} onChange={e => setCourse({...course, description: e.target.value})} />
                        </Form.Group>

                        <Row className="align-items-center mb-4">
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="fw-bold small text-muted">Price</Form.Label>
                                    <Form.Control type="number" value={course.price} onChange={e => setCourse({...course, price: e.target.value})} />
                                </Form.Group>
                            </Col>
                            
                            {role === 'admin' && (
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold small text-muted">Instructor</Form.Label>
                                        <Form.Select disabled>
                                            <option>{course.instructor?.username}</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            )}

                            <Col md={4}>
                                <div className="mt-4 pt-1">
                                    <Form.Check 
                                        type="switch"
                                        id="course-status"
                                        label={<span className="fw-bold ms-2">{course.is_active ? 'Active Course' : 'Hidden (Draft)'}</span>}
                                        checked={course.is_active}
                                        onChange={handleStatusChange}
                                        className="fs-5"
                                    />
                                </div>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-between pt-3 border-top">
                            <Button variant="outline-danger" className="px-4 rounded-2">Delete Course</Button>
                            <Button type="submit" variant="warning" className="px-5 fw-bold text-dark rounded-2" disabled={loading}>
                                {loading ? 'Saving...' : 'Update Details'}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            {/* 2. Course Content (Lessons) */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0 text-primary">
                    <i className="fas fa-layer-group me-2"></i>Course Content
                </h5>
                <Link to={role === 'admin' ? `/admin/course/${course.id}/add-lesson` : `/instructor/course/${course.id}/add-lesson`} 
                      className="btn btn-success btn-sm px-3 fw-bold shadow-sm">
                    <i class="fas fa-plus me-1"></i> Add Lesson
                </Link>
            </div>

            <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-5">
                <Table hover responsive className="mb-0 align-middle">
                    <thead className="bg-light text-muted small text-uppercase">
                        <tr>
                            <th className="ps-4 py-3">Order</th>
                            <th>Lesson Title</th>
                            <th>Type</th>
                            <th className="text-end pe-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {course.lessons && course.lessons.length > 0 ? (
                            course.lessons.map(lesson => (
                                <tr key={lesson.id}>
                                    <td className="ps-4">
                                        <div className="bg-secondary bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center fw-bold text-secondary" style={{width:'30px', height:'30px', fontSize:'0.8rem'}}>
                                            {lesson.order}
                                        </div>
                                    </td>
                                    <td className="fw-bold text-dark">{lesson.title}</td>
                                    <td>
                                        {lesson.video_url ? 
                                            <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 px-2">
                                                <i className="fas fa-video me-1"></i> Video
                                            </Badge> 
                                            : 
                                            <Badge bg="secondary" className="bg-opacity-10 text-secondary border px-2">
                                                <i className="fas fa-file-alt me-1"></i> Text
                                            </Badge>
                                        }
                                    </td>
                                    <td className="text-end pe-4">
                                        <div className="d-inline-flex gap-2">
                                            <Button variant="light" size="sm" className="text-muted"><i className="fas fa-pen"></i></Button>
                                            <Button variant="light" size="sm" className="text-danger"><i className="fas fa-trash"></i></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colspan="4" class="text-center py-4 text-muted">No lessons yet.</td></tr>
                        )}
                    </tbody>
                </Table>
            </Card>
        </>
    )
}

export default EditCourseForm