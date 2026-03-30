import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Clock, Calendar, Lock, Shield, Github, 
  FileText, Image, FileCode, ExternalLink, Download,
  ChevronRight, Hash, Link2, Code, Eye, ChevronDown, Loader, AlertCircle
} from 'lucide-react'
import { formatDate, formatDuration, getPhaseColor } from '../../utils/helpers'
import { getGitHubFile, getGitHubDefaultBranch } from '../../services/api'

const SessionDetail = ({ onClose, session }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [showCodeViewer, setShowCodeViewer] = useState(false)
  const [fileContent, setFileContent] = useState('')
  const [fileLoading, setFileLoading] = useState(false)
  const [fileError, setFileError] = useState('')
  const [fileBranch, setFileBranch] = useState('main')

  if (!session) return null

  const getFileIcon = (proof) => {
    if (proof.type === 'github') return <FileCode className="w-5 h-5 text-blue-600" />
    if (proof.fileType?.startsWith('image/')) return <Image className="w-5 h-5 text-green-600" />
    if (proof.fileType?.includes('pdf')) return <FileText className="w-5 h-5 text-red-600" />
    return <FileText className="w-5 h-5 text-gray-600" />
  }

  const getDifficultyStyle = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/10 text-green-400 border-green-500/30'
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
      case 'hard': return 'bg-orange-500/10 text-orange-400 border-orange-500/30'
      case 'expert': return 'bg-red-500/10 text-red-400 border-red-500/30'
      default: return 'bg-white/5 text-gray-400 border-white/10'
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

  // Get all proof of work files (support both snake_case and camelCase keys)
  const proofFiles = session.proof_of_work || session.proofOfWork || session.proofs || []
  const githubFiles = proofFiles.filter(f => f.type === 'github')
  const uploadedFiles = proofFiles.filter(f => f.type === 'upload')

  const handleFileClick = useCallback(async (file) => {
    if (file.type !== 'github') return
    setSelectedFile(file)
    setShowCodeViewer(true)
    setFileContent('')
    setFileError('')
    setFileLoading(true)
    setFileBranch('main')
    try {
      // repoName stored as "owner/repo" full_name
      const repoFullName = file.repoName || file.repo_name || ''
      const [owner, repo] = repoFullName.split('/')
      if (!owner || !repo) throw new Error('Unknown repository')
      // Fetch file content and default branch in parallel
      const [result, branch] = await Promise.all([
        getGitHubFile(owner, repo, file.path),
        getGitHubDefaultBranch(owner, repo),
      ])
      setFileContent(result.content || '')
      setFileBranch(branch)
    } catch (err) {
      setFileError(err.message || 'Failed to load file content.')
    } finally {
      setFileLoading(false)
    }
  }, [])

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
          className="glass-card glass-glow rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 bg-gradient-to-r from-primary-500/10 to-purple-500/10">
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
                <h2 className="text-2xl font-bold text-white mb-2">{session.topic}</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1.5" />
                    {formatDate(session.client_ts || session.clientTs)}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1.5" />
                    {formatDuration(session.duration_seconds || session.durationSeconds)}
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
                className="text-gray-500 hover:text-white transition-colors p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Notes Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Session Notes
              </h3>
              <div className="glass rounded-xl p-4 max-h-48 overflow-y-auto">
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {session.notes}
                </p>
              </div>
            </div>

            {/* Proof of Work Section - Enhanced */}
            {proofFiles.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Proof of Work ({proofFiles.length} files)
                </h3>
                
                {/* GitHub Files */}
                {githubFiles.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Github className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-300">GitHub Files</span>
                    </div>
                    <div className="grid gap-2 max-h-40 overflow-y-auto">
                      {githubFiles.map((file, index) => (
                        <button
                          key={index}
                          onClick={() => handleFileClick(file)}
                          className={`flex items-center justify-between p-2.5 glass border rounded-lg hover:shadow-md transition-all text-left ${
                            selectedFile?.path === file.path 
                              ? 'border-primary-500 bg-primary-500/10 ring-2 ring-primary-500/20' 
                              : 'border-white/10 hover:border-primary-500/30'
                          }`}
                        >
                          <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <FileCode className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span className="font-medium text-white text-sm truncate">{file.name || file.path.split('/').pop()}</span>
                          </div>
                          <div className="flex items-center space-x-1.5 flex-shrink-0 ml-2">
                            <span className="text-xs text-primary-600 font-medium">View</span>
                            <Eye className="w-3.5 h-3.5 text-primary-600" />
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
                                if (file) handleFileClick(file)
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
                      <div className="p-4 overflow-x-auto max-h-64 overflow-y-auto">
                        {fileLoading ? (
                          <div className="flex items-center justify-center py-12 text-gray-400">
                            <Loader className="w-5 h-5 animate-spin mr-2" />
                            <span className="text-sm">Loading file…</span>
                          </div>
                        ) : fileError ? (
                          <div className="flex items-center space-x-2 text-red-400 py-8 justify-center">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm">{fileError}</span>
                          </div>
                        ) : (
                          <pre className="text-sm font-mono">
                            <code className="text-gray-300">
                              {(fileContent || '').split('\n').map((line, idx) => (
                                <div key={idx} className="flex">
                                  <span className="text-gray-600 select-none w-8 text-right mr-4 flex-shrink-0">
                                    {idx + 1}
                                  </span>
                                  <span className="flex-1">{line || ' '}</span>
                                </div>
                              ))}
                            </code>
                          </pre>
                        )}
                      </div>
                      
                      {/* Code Viewer Footer */}
                      <div className="px-4 py-2 bg-gray-800 border-t border-gray-700 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {getLanguageFromFile(selectedFile.path)} • {fileContent.split('\n').length} lines
                        </span>
                        <a
                          href={`https://github.com/${selectedFile.repoName || selectedFile.repo_name}/blob/${fileBranch}/${selectedFile.path}`}
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
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-300">Uploaded Files</span>
                    </div>
                    <div className="grid gap-2">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 glass border border-white/10 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            {file.fileType?.startsWith('image/') ? (
                              <Image className="w-5 h-5 text-green-600" />
                            ) : (
                              <FileText className="w-5 h-5 text-red-600" />
                            )}
                            <div>
                              <p className="font-medium text-white">{file.name}</p>
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
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Blockchain Verification
              </h3>
              <div className="glass rounded-xl p-4 border border-emerald-500/20">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-emerald-400">Verified & Immutable</h4>
                    <p className="text-sm text-emerald-400/70">This session is cryptographically secured</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-gray-400 flex items-center">
                      <Hash className="w-4 h-4 mr-2" />
                      Entry Hash
                    </span>
                    <code className="text-xs bg-white/5 px-2 py-1 rounded font-mono text-gray-300">
                      {(session.entry_hash || session.entryHash)?.substring(0, 24)}...
                    </code>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-gray-400 flex items-center">
                      <Hash className="w-4 h-4 mr-2" />
                      Content Hash
                    </span>
                    <code className="text-xs bg-white/5 px-2 py-1 rounded font-mono text-gray-300">
                      {(session.content_hash || session.contentHash)?.substring(0, 24)}...
                    </code>
                  </div>

                  {(session.prev_hash || session.prevHash) && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-400 flex items-center">
                        <Link2 className="w-4 h-4 mr-2" />
                        Previous Hash
                      </span>
                      <code className="text-xs bg-white/5 px-2 py-1 rounded font-mono text-gray-300">
                        {(session.prev_hash || session.prevHash).substring(0, 24)}...
                      </code>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-white/5">
                  <p className="text-xs text-emerald-400/70">
                    <Lock className="w-3 h-3 inline mr-1" />
                    Logged on {new Date(session.server_ts || session.serverTs || session.client_ts || session.clientTs).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 glass">
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
