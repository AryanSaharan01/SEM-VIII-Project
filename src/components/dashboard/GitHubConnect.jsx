import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Github, CheckCircle, Folder, FileCode, ChevronRight, ChevronDown, Loader, Link2, Unlink } from 'lucide-react'

const GitHubConnect = ({ onClose, onConnect, existingConnection }) => {
  const [step, setStep] = useState(existingConnection ? 'connected' : 'connect')
  const [loading, setLoading] = useState(false)
  const [repos, setRepos] = useState([])
  const [selectedRepo, setSelectedRepo] = useState(existingConnection?.repo || null)
  const [repoContents, setRepoContents] = useState([])
  const [expandedFolders, setExpandedFolders] = useState({})
  const [loadingFolder, setLoadingFolder] = useState(null)

  // Mock GitHub repos for demo
  const mockRepos = [
    { id: 1, name: 'react-portfolio', fullName: 'user/react-portfolio', description: 'My personal portfolio built with React', language: 'JavaScript', stars: 12 },
    { id: 2, name: 'python-ml-projects', fullName: 'user/python-ml-projects', description: 'Machine learning experiments', language: 'Python', stars: 8 },
    { id: 3, name: 'node-api-starter', fullName: 'user/node-api-starter', description: 'Express.js API boilerplate', language: 'JavaScript', stars: 25 },
    { id: 4, name: 'data-structures', fullName: 'user/data-structures', description: 'DSA implementations in multiple languages', language: 'TypeScript', stars: 45 },
    { id: 5, name: 'leetcode-solutions', fullName: 'user/leetcode-solutions', description: 'My LeetCode problem solutions', language: 'Python', stars: 15 },
  ]

  // Mock folder structure
  const mockRepoContents = {
    'react-portfolio': [
      { name: 'src', type: 'dir', path: 'src' },
      { name: 'public', type: 'dir', path: 'public' },
      { name: 'package.json', type: 'file', path: 'package.json' },
      { name: 'README.md', type: 'file', path: 'README.md' },
    ],
    'src': [
      { name: 'components', type: 'dir', path: 'src/components' },
      { name: 'pages', type: 'dir', path: 'src/pages' },
      { name: 'App.jsx', type: 'file', path: 'src/App.jsx' },
      { name: 'index.js', type: 'file', path: 'src/index.js' },
    ],
    'src/components': [
      { name: 'Header.jsx', type: 'file', path: 'src/components/Header.jsx' },
      { name: 'Footer.jsx', type: 'file', path: 'src/components/Footer.jsx' },
      { name: 'Portfolio.jsx', type: 'file', path: 'src/components/Portfolio.jsx' },
    ],
  }

  const handleGitHubAuth = async () => {
    setLoading(true)
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 1500))
    setRepos(mockRepos)
    setStep('selectRepo')
    setLoading(false)
  }

  const handleSelectRepo = async (repo) => {
    setSelectedRepo(repo)
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    setRepoContents(mockRepoContents['react-portfolio'] || [])
    setStep('connected')
    setLoading(false)
    onConnect({ repo, connected: true })
  }

  const handleDisconnect = () => {
    setSelectedRepo(null)
    setRepoContents([])
    setStep('connect')
    onConnect(null)
  }

  const toggleFolder = async (path) => {
    if (expandedFolders[path]) {
      setExpandedFolders(prev => ({ ...prev, [path]: null }))
    } else {
      setLoadingFolder(path)
      await new Promise(resolve => setTimeout(resolve, 500))
      const contents = mockRepoContents[path] || [
        { name: 'example.js', type: 'file', path: `${path}/example.js` },
      ]
      setExpandedFolders(prev => ({ ...prev, [path]: contents }))
      setLoadingFolder(null)
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
          className="bg-white rounded-2xl p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Github className="w-8 h-8 text-gray-900" />
              <h2 className="text-2xl font-bold text-gray-900">GitHub Integration</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Connect Step */}
          {step === 'connect' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Github className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Your GitHub</h3>
              <p className="text-gray-600 mb-6">
                Link your GitHub account to attach code files as proof of work for your coding skills.
              </p>
              <button
                onClick={handleGitHubAuth}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Github className="w-5 h-5" />
                    <span>Authorize GitHub</span>
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 mt-4">
                We only request read access to your public repositories.
              </p>
            </div>
          )}

          {/* Select Repo Step */}
          {step === 'selectRepo' && (
            <div>
              <p className="text-gray-600 mb-4">Select a repository to link with your skill:</p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {repos.map(repo => (
                  <button
                    key={repo.id}
                    onClick={() => handleSelectRepo(repo)}
                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{repo.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{repo.description}</p>
                        <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center">
                            <span className={`w-3 h-3 rounded-full mr-1 ${
                              repo.language === 'JavaScript' ? 'bg-yellow-400' :
                              repo.language === 'Python' ? 'bg-blue-500' :
                              repo.language === 'TypeScript' ? 'bg-blue-600' : 'bg-gray-400'
                            }`} />
                            {repo.language}
                          </span>
                          <span>⭐ {repo.stars}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Connected Step */}
          {step === 'connected' && selectedRepo && (
            <div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-green-900">Connected to GitHub</h4>
                    <p className="text-sm text-green-700">{selectedRepo.fullName || selectedRepo.name}</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                You can now select files from this repository as proof of work when logging sessions.
              </p>

              <button
                onClick={handleDisconnect}
                className="w-full btn-secondary flex items-center justify-center space-x-2 text-red-600 border-red-300 hover:bg-red-50"
              >
                <Unlink className="w-4 h-4" />
                <span>Disconnect Repository</span>
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default GitHubConnect
