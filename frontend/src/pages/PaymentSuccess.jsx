import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Container, Spinner } from 'react-bootstrap'

function PaymentSuccess() {
    const { courseId } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        const token = localStorage.getItem('token')
        
        // نكلم الباك إند نأكد الاشتراك
        axios.post(`http://127.0.0.1:8000/api/enroll/confirm/${courseId}/`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(res => {
            // نجحنا! روح لصفحة الكورسات
            navigate('/my-courses')
        })
        .catch(err => {
            console.error(err)
            alert("Error confirming enrollment!")
            navigate('/')
        })

    }, [courseId, navigate])

    return (
        <Container className="text-center py-5" style={{marginTop: '100px'}}>
            <Spinner animation="grow" variant="success" />
            <h3 className="mt-3">Confirming your payment...</h3>
            <p className="text-muted">Please wait while we enroll you in the course.</p>
        </Container>
    )
}

export default PaymentSuccess