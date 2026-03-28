import React, { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'

// Lazy load pages for code splitting
const Landing = lazy(() => import('./pages/Landing'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const CapsuleView = lazy(() => import('./pages/CapsuleView'))

// Full-page loading spinner
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0a0f1a]">
    <div className="relative flex flex-col items-center gap-4">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-500/20 border-t-primary-500" />
        <div className="absolute inset-0 rounded-full blur-md bg-primary-500/20" />
      </div>
      <p className="text-gray-500 text-sm animate-pulse">Loading…</p>
    </div>
  </div>
)

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

  // Navigate to dashboard when user logs in; clear any stale cached data first
  useEffect(() => {
    if (isAuthenticated && !window.location.pathname.startsWith('/capsule/')) {
      // Clear old session cache so a newly logged-in user never sees someone else's data
      sessionStorage.removeItem('skillLedgerSkills')
      sessionStorage.removeItem('skillLedgerSessions')
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('dtcs_token')
    localStorage.removeItem('dtcs_user')
    localStorage.removeItem('skillLedgerGitHubRepos')
    // Clear cached dashboard data so the next user starts fresh
    sessionStorage.removeItem('skillLedgerSkills')
    sessionStorage.removeItem('skillLedgerSessions')
    setIsAuthenticated(false)
    setUser(null)
    navigate('/')
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Landing setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/capsule/:token" element={<CapsuleView />} />
        <Route 
          path="/dashboard/*" 
          element={isAuthenticated ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/" />} 
        />
      </Routes>
    </Suspense>
  )
}

export default App
