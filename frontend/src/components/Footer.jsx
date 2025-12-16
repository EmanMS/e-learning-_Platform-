import { Container, Row, Col } from 'react-bootstrap'

function Footer() {
    return (
        <footer className="pt-5 pb-3 mt-auto border-top" style={{ backgroundColor: 'var(--bs-card-bg)' }}>
            <Container>
                <Row>
                    <Col md={4} className="mb-4">
                        <h5 className="fw-bold text-primary mb-3"><i className="fas fa-graduation-cap"></i> E-Learn</h5>
                        <p className="text-muted small">
                            Empowering learners worldwide with the best courses. Join our community and start learning today.
                        </p>
                    </Col>
                    <Col md={2} className="mb-4">
                        <h6 className="fw-bold text-dark mb-3">Platform</h6>
                        <ul className="list-unstyled small text-muted">
                            <li className="mb-2">Browse Courses</li>
                            <li className="mb-2">Become Instructor</li>
                            <li className="mb-2">Pricing</li>
                        </ul>
                    </Col>
                    <Col md={2} className="mb-4">
                        <h6 className="fw-bold text-dark mb-3">Support</h6>
                        <ul className="list-unstyled small text-muted">
                            <li className="mb-2">Help Center</li>
                            <li className="mb-2">Terms of Service</li>
                            <li className="mb-2">Privacy Policy</li>
                        </ul>
                    </Col>
                    <Col md={4} className="mb-4">
                        <h6 className="fw-bold text-dark mb-3">Subscribe</h6>
                        <div className="input-group">
                            <input type="email" className="form-control form-control-sm" placeholder="Your email" />
                            <button className="btn btn-primary btn-sm">Subscribe</button>
                        </div>
                    </Col>
                </Row>
                <hr className="text-muted opacity-25" />
                <p className="text-center text-muted small mb-0">&copy; 2025 E-Learn Platform. All rights reserved.</p>
            </Container>
        </footer>
    )
}

export default Footer