import { Navigate } from 'react-router-dom'
import { jwtDecode } from "jwt-decode";// هتحتاجي تسطبيها: npm install jwt-decode

function PrivateRoute({ children, role }) {
    const token = localStorage.getItem('token')
    
    if (!token) {
        return <Navigate to="/login" />
    }

    // لو عايزين نتحقق من الدور (Role) كمان (اختياري ومحتاج التوكن يكون فيه الدور)
    // حالياً هنكتفي بالتحقق من التسجيل فقط للمرحلة دي
    
    return children
}

export default PrivateRoute