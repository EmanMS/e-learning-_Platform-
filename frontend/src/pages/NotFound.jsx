import { Container, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

function NotFound() {
    return (
        <Container className="d-flex flex-column align-items-center justify-content-center" style={{minHeight: '70vh'}}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
                <h1 className="display-1 fw-bold text-primary">404</h1>
            </motion.div>
            
            <h3 className="fw-bold mb-3 text-dark">Oops! Page not found</h3>
            <p className="text-muted text-center mb-4" style={{maxWidth: '500px'}}>
                It seems you've wandered into the unknown. The page you are looking for might have been removed or is temporarily unavailable.
            </p>
            
            <Link to="/">
                <Button variant="primary" size="lg" className="rounded-pill px-5 shadow">Go Home</Button>
            </Link>
        </Container>
    )
}
export default NotFound