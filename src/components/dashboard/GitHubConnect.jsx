import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Github, CheckCircle, Loader, Trash2, Plus, ExternalLink } from 'lucide-react'

const GitHubConnect = ({ onClose, onConnect, connectedRepos = [] }) => {
  const [step, setStep] = useState(connectedRepos.length > 0 ? 'manage' : 'connect')
  const [loading, setLoading] = useState(false)
  const [availableRepos, setAvailableRepos] = useState([])
  const [selectedRepos, setSelectedRepos] = useState(connectedRepos)
  const [isAuthorized, setIsAuthorized] = useState(connectedRepos.length > 0)

  // Mock GitHub repos for demo
  const mockRepos = [
    { id: 1, name: 'react-portfolio', fullName: 'user/react-portfolio', description: 'My personal portfolio built with React', language: 'JavaScript', stars: 12 },
    { id: 2, name: 'python-ml-projects', fullName: 'user/python-ml-projects', description: 'Machine learning experiments', language: 'Python', stars: 8 },
    { id: 3, name: 'node-api-starter', fullName: 'user/node-api-starter', description: 'Express.js API boilerplate', language: 'JavaScript', stars: 25 },
    { id: 4, name: 'data-structures', fullName: 'user/data-structures', description: 'DSA implementations in multiple languages', language: 'TypeScript', stars: 45 },
    { id: 5, name: 'leetcode-solutions', fullName: 'user/leetcode-solutions', description: 'My LeetCode problem solutions', language: 'Python', stars: 15 },
    { id: 6, name: 'ecommerce-backend', fullName: 'user/ecommerce-backend', description: 'Node.js + Express e-commerce API', language: 'JavaScript', stars: 32 },
    { id: 7, name: 'flutter-weather-app', fullName: 'user/flutter-weather-app', description: 'Weather app built with Flutter', language: 'Dart', stars: 18 },
  ]

  const handleGitHubAuth = async () => {
    setLoading(true)
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 1500))
    setAvailableRepos(mockRepos)
    setIsAuthorized(true)
    setStep('selectRepos')
    setLoading(false)
  }

  const toggleRepoSelection = (repo) => {
    setSelectedRepos(prev => {
      const isSelected = prev.some(r => r.id === repo.id)
      if (isSelected) {
        return prev.filter(r => r.id !== repo.id)
      } else {
        return [...prev, repo]
      }
    })
  }

  const handleSaveRepos = () => {
    onConnect(selectedRepos)
    setStep('manage')
  }

  const handleRemoveRepo = (repoId) => {
    const updated = selectedRepos.filter(r => r.id !== repoId)
    setSelectedRepos(updated)
    onConnect(updated)
  }

  const handleAddMore = async () => {
    if (availableRepos.length === 0) {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 800))
      setAvailableRepos(mockRepos)
      setLoading(false)
    }
    setStep('selectRepos')
  }

  const handleDisconnectAll = () => {
    setSelectedRepos([])
    setIsAuthorized(false)
    onConnect([])
    setStep('connect')
  }

  const getLanguageColor = (language) => {
    const colors = {
      'JavaScript': 'bg-yellow-400',
      'TypeScript': 'bg-blue-600',
      'Python': 'bg-blue-500',
      'Java': 'bg-red-500',
      'Dart': 'bg-cyan-500',
      'Go': 'bg-cyan-400',
      'Rust': 'bg-orange-500',
    }
    return colors[language] || 'bg-gray-400'
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

          {/* Connect Step - Initial Authorization */}
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

          {/* Select Repos Step - Multi-select */}
          {step === 'selectRepos' && (
            <div>
              <p className="text-gray-600 mb-4">
                Select repositories to connect. You can link them to your coding skills later.
              </p>
              
              <div className="space-y-2 max-h-80 overflow-y-auto mb-6">
                {availableRepos.map(repo => {
                  const isSelected = selectedRepos.some(r => r.id === repo.id)
                  return (
                    <button
                      key={repo.id}
                      onClick={() => toggleRepoSelection(repo)}
                      className={`w-full text-left p-4 border rounded-lg transition-all ${
                        isSelected 
                          ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-gray-900">{repo.name}</h4>
                            {isSelected && (
                              <CheckCircle className="w-4 h-4 text-primary-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-1">{repo.description}</p>
                          <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                            <span className="flex items-center">
                              <span className={`w-3 h-3 rounded-full mr-1 ${getLanguageColor(repo.language)}`} />
                              {repo.language}
                            </span>
                            <span>⭐ {repo.stars}</span>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'bg-primary-600 border-primary-600' : 'border-gray-300'
                        }`}>
                          {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSaveRepos}
                  disabled={selectedRepos.length === 0}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Connect {selectedRepos.length > 0 ? `(${selectedRepos.length})` : ''} Repositories
                </button>
                <button
                  onClick={() => setStep(selectedRepos.length > 0 ? 'manage' : 'connect')}
                  className="btn-secondary px-6"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Manage Step - View/Remove connected repos */}
          {step === 'manage' && (
            <div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-green-900">GitHub Connected</h4>
                    <p className="text-sm text-green-700">{selectedRepos.length} repositories linked</p>
                  </div>
                </div>
              </div>

              <h4 className="font-medium text-gray-700 mb-3">Connected Repositories</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto mb-6">
                {selectedRepos.map(repo => (
                  <div
                    key={repo.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <Github className="w-5 h-5 text-gray-700" />
                      <div>
                        <h5 className="font-medium text-gray-900">{repo.name}</h5>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span className={`w-2 h-2 rounded-full ${getLanguageColor(repo.language)}`} />
                          <span>{repo.language}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href={`https://github.com/${repo.fullName}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleRemoveRepo(repo.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleAddMore}
                  disabled={loading}
                  className="w-full btn-secondary flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>Add More Repositories</span>
                </button>
                <button
                  onClick={handleDisconnectAll}
                  className="w-full text-sm text-red-600 hover:text-red-700 py-2 transition-colors"
                >
                  Disconnect GitHub Account
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default GitHubConnect
