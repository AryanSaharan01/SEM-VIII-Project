import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Clock, Calendar, Lock, Shield, Github, 
  FileText, Image, FileCode, ExternalLink, Download,
  ChevronRight, Hash, Link2, Code, Eye, ChevronDown
} from 'lucide-react'
import { formatDate, formatDuration, getPhaseColor } from '../../utils/helpers'

const SessionDetail = ({ onClose, session }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [showCodeViewer, setShowCodeViewer] = useState(false)

  if (!session) return null

  // Mock file contents for GitHub files
  const mockFileContents = {
    'src/App.jsx': `import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import './App.css'

function App() {
  const [user, setUser] = useState(null)

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Landing onLogin={setUser} />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App`,
    'src/components/Header.jsx': `import React from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, User } from 'lucide-react'

const Header = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm border-b">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="font-bold text-xl">
              SkillLedger
            </Link>
          </div>
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user.name}</span>
              <button onClick={onLogout}>Logout</button>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Header`,
    'src/pages/Dashboard.jsx': `import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Sidebar from '../components/dashboard/Sidebar'
import SkillCard from '../components/dashboard/SkillCard'
import Timeline from '../components/dashboard/Timeline'

const Dashboard = ({ user }) => {
  const [skills, setSkills] = useState([])
  const [selectedSkill, setSelectedSkill] = useState(null)

  useEffect(() => {
    // Load user skills
    loadSkills()
  }, [])

  const loadSkills = async () => {
    const data = await fetchSkills()
    setSkills(data)
    if (data.length > 0) setSelectedSkill(data[0])
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar skills={skills} onSelectSkill={setSelectedSkill} />
      <main className="ml-64 p-8">
        {selectedSkill && <SkillCard skill={selectedSkill} />}
      </main>
    </div>
  )
}

export default Dashboard`,
    'src/utils/helpers.js': `// Helper utility functions

export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return \`\${hours}h \${minutes}m\`
  return \`\${minutes}m\`
}

export const getPhaseColor = (phase) => {
  const colors = {
    'Exposure': 'bg-purple-500',
    'Confusion': 'bg-red-500',
    'Learning': 'bg-yellow-500',
    'Integration': 'bg-blue-500',
    'Proficiency': 'bg-green-500'
  }
  return colors[phase] || 'bg-gray-500'
}`,
    'package.json': `{
  "name": "skill-ledger",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.0.0",
    "framer-motion": "^10.0.0",
    "lucide-react": "^0.263.0",
    "tailwindcss": "^3.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}`
  }

  const getFileContent = (file) => {
    // For GitHub files, try to get mock content
    if (file.type === 'github') {
      return mockFileContents[file.path] || `// Content of ${file.path}\n// File loaded from GitHub repository\n\nconsole.log('Hello from ${file.name}');`
    }
    return null
  }

  const getFileIcon = (proof) => {
    if (proof.type === 'github') return <FileCode className="w-5 h-5 text-blue-600" />
    if (proof.fileType?.startsWith('image/')) return <Image className="w-5 h-5 text-green-600" />
    if (proof.fileType?.includes('pdf')) return <FileText className="w-5 h-5 text-red-600" />
    return <FileText className="w-5 h-5 text-gray-600" />
  }

  const getDifficultyStyle = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-300'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'hard': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'expert': return 'bg-red-100 text-red-700 border-red-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getLanguageFromFile = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    const langMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'css': 'css',
      'html': 'html',
      'json': 'json',
      'md': 'markdown'
    }
    return langMap[ext] || 'plaintext'
  }

  // Get all proof of work files (support both 'proofs' and 'proofOfWork' keys)
  const proofFiles = session.proofOfWork || session.proofs || []
  const githubFiles = proofFiles.filter(f => f.type === 'github')
  const uploadedFiles = proofFiles.filter(f => f.type === 'upload')

  const handleFileClick = (file) => {
    if (file.type === 'github') {
      setSelectedFile(file)
      setShowCodeViewer(true)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-100 flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-purple-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPhaseColor(session.phase)} text-white`}>
                    {session.phase}
                  </span>
                  {session.difficulty && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyStyle(session.difficulty)}`}>
                      {session.difficulty}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{session.topic}</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1.5" />
                    {formatDate(session.clientTs)}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1.5" />
                    {formatDuration(session.durationSeconds)}
                  </span>
                  {proofFiles.length > 0 && (
                    <span className="flex items-center text-primary-600">
                      <FileCode className="w-4 h-4 mr-1.5" />
                      {proofFiles.length} files attached
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Notes Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                Session Notes
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {session.notes}
                </p>
              </div>
            </div>

            {/* Proof of Work Section - Enhanced */}
            {proofFiles.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                  Proof of Work ({proofFiles.length} files)
                </h3>
                
                {/* GitHub Files */}
                {githubFiles.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Github className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">GitHub Files</span>
                    </div>
                    <div className="grid gap-2">
                      {githubFiles.map((file, index) => (
                        <button
                          key={index}
                          onClick={() => handleFileClick(file)}
                          className={`flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-md transition-all text-left ${
                            selectedFile?.path === file.path 
                              ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200' 
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <FileCode className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-gray-900">{file.name || file.path.split('/').pop()}</p>
                              <p className="text-xs text-gray-500">{file.path}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-primary-600 font-medium">View Code</span>
                            <Eye className="w-4 h-4 text-primary-600" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Code Viewer */}
                {showCodeViewer && selectedFile && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4"
                  >
                    <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
                      {/* Code Viewer Header */}
                      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                          </div>
                          <span className="text-sm text-gray-300 font-mono">{selectedFile.path}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {githubFiles.length > 1 && (
                            <select
                              value={selectedFile.path}
                              onChange={(e) => {
                                const file = githubFiles.find(f => f.path === e.target.value)
                                if (file) setSelectedFile(file)
                              }}
                              className="text-xs bg-gray-700 text-gray-300 border border-gray-600 rounded px-2 py-1"
                            >
                              {githubFiles.map((file, idx) => (
                                <option key={idx} value={file.path}>
                                  {file.name || file.path.split('/').pop()}
                                </option>
                              ))}
                            </select>
                          )}
                          <button
                            onClick={() => setShowCodeViewer(false)}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Code Content */}
                      <div className="p-4 overflow-x-auto max-h-80 overflow-y-auto">
                        <pre className="text-sm font-mono">
                          <code className="text-gray-300">
                            {getFileContent(selectedFile)?.split('\n').map((line, idx) => (
                              <div key={idx} className="flex">
                                <span className="text-gray-600 select-none w-8 text-right mr-4 flex-shrink-0">
                                  {idx + 1}
                                </span>
                                <span className="flex-1">{line || ' '}</span>
                              </div>
                            ))}
                          </code>
                        </pre>
                      </div>
                      
                      {/* Code Viewer Footer */}
                      <div className="px-4 py-2 bg-gray-800 border-t border-gray-700 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {getLanguageFromFile(selectedFile.path)} • {getFileContent(selectedFile)?.split('\n').length || 0} lines
                        </span>
                        <a
                          href={`https://github.com/${selectedFile.repoName || 'user/repo'}/blob/main/${selectedFile.path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View on GitHub
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Uploaded Files</span>
                    </div>
                    <div className="grid gap-2">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            {file.fileType?.startsWith('image/') ? (
                              <Image className="w-5 h-5 text-green-600" />
                            ) : (
                              <FileText className="w-5 h-5 text-red-600" />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">{file.fileType || 'document'}</p>
                            </div>
                          </div>
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Verification Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                Blockchain Verification
              </h3>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900">Verified & Immutable</h4>
                    <p className="text-sm text-green-700">This session is cryptographically secured</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-green-200">
                    <span className="text-sm text-gray-600 flex items-center">
                      <Hash className="w-4 h-4 mr-2" />
                      Entry Hash
                    </span>
                    <code className="text-xs bg-white px-2 py-1 rounded font-mono text-gray-700">
                      {session.entryHash?.substring(0, 24)}...
                    </code>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-green-200">
                    <span className="text-sm text-gray-600 flex items-center">
                      <Hash className="w-4 h-4 mr-2" />
                      Content Hash
                    </span>
                    <code className="text-xs bg-white px-2 py-1 rounded font-mono text-gray-700">
                      {session.contentHash?.substring(0, 24)}...
                    </code>
                  </div>

                  {session.prevHash && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600 flex items-center">
                        <Link2 className="w-4 h-4 mr-2" />
                        Previous Hash
                      </span>
                      <code className="text-xs bg-white px-2 py-1 rounded font-mono text-gray-700">
                        {session.prevHash.substring(0, 24)}...
                      </code>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-green-200">
                  <p className="text-xs text-green-700">
                    <Lock className="w-3 h-3 inline mr-1" />
                    Logged on {new Date(session.serverTs || session.clientTs).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="w-full btn-secondary"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default SessionDetail
