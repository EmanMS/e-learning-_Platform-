import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Navbar, Container, Nav, Button, Dropdown } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Toaster } from 'react-hot-toast'

// Pages
import Home from './pages/Home'
import CourseDetail from './pages/CourseDetail'
import Login from './pages/Login'
import Signup from './pages/Signup'
import MyCourses from './pages/MyCourses'
import PaymentSuccess from './pages/PaymentSuccess'
import ProfileSettings from './pages/ProfileSettings'
import InstructorDashboard from './pages/InstructorDashboard'
import CreateCourse from './pages/CreateCourse'
import AddLesson from './pages/AddLesson'
import AdminDashboard from './pages/AdminDashboard'
import AdminStudents from './pages/AdminStudents'
import AdminInstructors from './pages/AdminInstructors'
import AdminEditCourse from './pages/AdminEditCourse'
import InstructorEditCourse from './pages/InstructorEditCourse'
import InstructorStudents from './pages/InstructorStudents'
import Wishlist from './pages/Wishlist' // (تأكدي انك عملتي الصفحة دي)
import PrivateRoute from './components/PrivateRoute'
import Footer from './components/Footer'
import InstructorProfile from './pages/InstructorProfile'
import ScrollToTop from './components/ScrollToTop'
import StudentDetails from './pages/StudentDetails'
import AdminEditStudents from './pages/AdminEditStudent'

function App() {
  // --- 1. إعدادات الثيم (Dark Mode) ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  // --- 2. إعدادات المستخدم ---
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  const username = localStorage.getItem('username') || 'User'
  const isAuthenticated = !!token

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/login"
  }

  const getDashboardLink = () => {
    if (role === 'admin') return '/dashboard/admin'
    if (role === 'instructor') return '/instructor/dashboard'
    return '/my-courses'
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster position="top-center" />

      {/* Navbar */}
      <Navbar bg="body-tertiary" expand="lg" className="shadow-sm border-bottom fixed-top" style={{ height: '70px' }}>
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold text-primary fs-4 d-flex align-items-center">
            <i className="fas fa-graduation-cap me-2"></i> E-Learn
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center">

              <Nav.Link as={Link} to="/" className="fw-semibold me-3">Explore</Nav.Link>

              {/* ✅ زرار تغيير الثيم */}
              <Button
                variant="link"
                onClick={toggleTheme}
                className="text-decoration-none me-3 p-0 fs-5"
                title="Toggle Theme"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </Button>

              {isAuthenticated ? (
                <Dropdown align="end">
                  <Dropdown.Toggle variant="transparent" className="border-0 p-0 no-arrow">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                      style={{ width: '40px', height: '40px', fontSize: '1.2rem', fontWeight: 'bold', border: '2px solid #eef2ff' }}>
                      {username.charAt(0).toUpperCase()}
                    </div>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="shadow-lg border-0 rounded-4 mt-2 p-2" style={{ width: '240px' }}>
                    <div className="px-3 py-2 border-bottom mb-2">
                      <h6 className="fw-bold mb-0">{username}</h6>
                      <span className={`badge mt-1 bg-opacity-10 text-primary bg-primary`}>
                        {role ? role.toUpperCase() : 'STUDENT'}
                      </span>
                    </div>

                    <Dropdown.Item as={Link} to={getDashboardLink()} className="rounded-2 py-2 mb-1">
                      <i className="fas fa-th-large me-2 opacity-75 w-20"></i> Dashboard
                    </Dropdown.Item>

                    {/* رابط الويشليست للطالب */}
                    {role === 'student' && (
                      <Dropdown.Item as={Link} to="/wishlist" className="rounded-2 py-2 mb-1">
                        <i className="fas fa-heart me-2 opacity-75 w-20"></i> Wishlist
                      </Dropdown.Item>
                    )}

                    <Dropdown.Item as={Link} to="/settings" className="rounded-2 py-2 mb-1">
                      <i className="fas fa-cog me-2 opacity-75 w-20"></i> Settings
                    </Dropdown.Item>

                    <Dropdown.Divider className="my-2" />

                    <Dropdown.Item onClick={handleLogout} className="rounded-2 py-2 text-danger fw-bold">
                      <i className="fas fa-sign-out-alt me-2 w-20"></i> Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login" className="fw-semibold me-3">Login</Nav.Link>
                  <Link to="/signup" className="btn btn-primary text-white px-4 rounded-pill text-decoration-none shadow-sm">
                    Sign Up
                  </Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div style={{ marginTop: '70px', minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/my-courses" element={<PrivateRoute><MyCourses /></PrivateRoute>} />
          <Route path="/wishlist" element={<PrivateRoute><Wishlist /></PrivateRoute>} />
          <Route path="/payment-success/:courseId" element={<PaymentSuccess />} />
          <Route path="/settings" element={<PrivateRoute><ProfileSettings /></PrivateRoute>} />

          <Route path="/instructor/dashboard" element={<PrivateRoute><InstructorDashboard /></PrivateRoute>} />
          <Route path="/instructor/create" element={<PrivateRoute><CreateCourse /></PrivateRoute>} />
          <Route path="/instructor/edit-course/:id" element={<PrivateRoute><InstructorEditCourse /></PrivateRoute>} />
          <Route path="/instructor/course/:courseId/add-lesson" element={<PrivateRoute><AddLesson /></PrivateRoute>} />
          <Route path="/instructor/students" element={<PrivateRoute><InstructorStudents /></PrivateRoute>} />

          <Route path="/dashboard/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/students" element={<PrivateRoute><AdminStudents /></PrivateRoute>} />
          <Route path="/admin/instructors" element={<PrivateRoute><AdminInstructors /></PrivateRoute>} />
          <Route path="/admin/edit-course/:id" element={<PrivateRoute><AdminEditCourse /></PrivateRoute>} />
          <Route path="/instructor/:id" element={<InstructorProfile />} />
          <Route path="/student/:id" element={<PrivateRoute><StudentDetails /></PrivateRoute>} />
          <Route path="/admin/student/edit/:id" element={<PrivateRoute><AdminEditStudents /></PrivateRoute>} />

        </Routes>
      </div>

      <Footer />
    </BrowserRouter>
  )
}
export default App