import React from 'react'
import { Lock, Home, BookOpen, BarChart3, Settings, LogOut, User, Calendar, Trophy, FileText } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpen, label: 'My Skills', path: '/dashboard/skills' },
    { icon: Calendar, label: 'Sessions', path: '/dashboard/sessions' },
    { icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics' },
    { icon: Trophy, label: 'Achievements', path: '/dashboard/achievements' },
    { icon: FileText, label: 'Capsules', path: '/dashboard/capsules' },
  ]

  const handleLogout = () => {
    localStorage.removeItem('dtcs_token')
    if (onLogout) onLogout()
    navigate('/')
  }

  return (
    <div className="flex flex-col h-screen bg-white border-r border-neutral-200 w-64 fixed left-0 top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 p-6 border-b border-neutral-200">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
          <Lock className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold gradient-text">Skill Ledger</h1>
          <p className="text-xs text-gray-500">Your Learning Journey</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-2 px-4">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path
            return (
              <li key={index}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                      : 'text-gray-700 hover:bg-neutral-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="border-t border-neutral-200 p-4 space-y-2">
        <button
          onClick={() => navigate('/dashboard/profile')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-neutral-50 transition-all duration-200"
        >
          <User className="w-5 h-5" />
          <span className="font-medium">Profile</span>
        </button>
        <button
          onClick={() => navigate('/dashboard/settings')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-neutral-50 transition-all duration-200"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
