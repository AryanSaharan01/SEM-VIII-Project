import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check if user is authenticated (token in localStorage)
    const token = localStorage.getItem('dtcs_token')
    const userData = localStorage.getItem('dtcs_user')
    
    if (token && userData) {
      setIsAuthenticated(true)
      setUser(JSON.parse(userData))
    }
  }, [])

  return (
    <Router>
      <AppRoutes 
        isAuthenticated={isAuthenticated} 
        setIsAuthenticated={setIsAuthenticated}
        user={user}
        setUser={setUser}
      />
    </Router>
  )
}

function AppRoutes({ isAuthenticated, setIsAuthenticated, user, setUser }) {
  const navigate = useNavigate()

  // Navigate to dashboard when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('dtcs_token')
    localStorage.removeItem('dtcs_user')
    setIsAuthenticated(false)
    setUser(null)
    navigate('/')
  }

  return (
    <Routes>
      <Route path="/" element={<Landing setIsAuthenticated={setIsAuthenticated} />} />
      <Route 
        path="/dashboard/*" 
        element={isAuthenticated ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/" />} 
      />
    </Routes>
  )
}

export default App
