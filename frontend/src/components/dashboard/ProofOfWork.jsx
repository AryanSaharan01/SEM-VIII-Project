import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Github, FileCode, Image, FileText, Upload, Trash2, 
  ChevronRight, ChevronDown, Folder, File, Check, Loader,
  Link2, ExternalLink
} from 'lucide-react'

const ProofOfWork = ({ 
  isOpen, 
  onClose, 
  onSave, 
  skillCategory,
  githubConnection,
  existingProofs = []
}) => {
  const [proofs, setProofs] = useState(existingProofs)
  const [activeTab, setActiveTab] = useState(skillCategory === 'coding' && githubConnection ? 'github' : 'upload')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [expandedFolders, setExpandedFolders] = useState({})
  const [loadingFolder, setLoadingFolder] = useState(null)
  const fileInputRef = useRef(null)

  // Mock GitHub file structure
  const mockRepoStructure = {
    root: [
      { name: 'src', type: 'dir', path: 'src' },
      { name: 'public', type: 'dir', path: 'public' },
      { name: 'package.json', type: 'file', path: 'package.json' },
      { name: 'README.md', type: 'file', path: 'README.md' },
    ],
    'src': [
      { name: 'components', type: 'dir', path: 'src/components' },
      { name: 'pages', type: 'dir', path: 'src/pages' },
      { name: 'hooks', type: 'dir', path: 'src/hooks' },
      { name: 'App.jsx', type: 'file', path: 'src/App.jsx' },
      { name: 'index.js', type: 'file', path: 'src/index.js' },
      { name: 'styles.css', type: 'file', path: 'src/styles.css' },
    ],
    'src/components': [
      { name: 'Header.jsx', type: 'file', path: 'src/components/Header.jsx' },
      { name: 'Footer.jsx', type: 'file', path: 'src/components/Footer.jsx' },
      { name: 'Card.jsx', type: 'file', path: 'src/components/Card.jsx' },
      { name: 'Modal.jsx', type: 'file', path: 'src/components/Modal.jsx' },
    ],
    'src/pages': [
      { name: 'Home.jsx', type: 'file', path: 'src/pages/Home.jsx' },
      { name: 'About.jsx', type: 'file', path: 'src/pages/About.jsx' },
      { name: 'Contact.jsx', type: 'file', path: 'src/pages/Contact.jsx' },
    ],
    'src/hooks': [
      { name: 'useAuth.js', type: 'file', path: 'src/hooks/useAuth.js' },
      { name: 'useFetch.js', type: 'file', path: 'src/hooks/useFetch.js' },
    ],
  }

  const toggleFolder = async (path) => {
    if (expandedFolders[path]) {
      setExpandedFolders(prev => {
        const next = { ...prev }
        delete next[path]
        return next
      })
    } else {
      setLoadingFolder(path)
      await new Promise(resolve => setTimeout(resolve, 300))
      setExpandedFolders(prev => ({
        ...prev,
        [path]: mockRepoStructure[path] || []
      }))
      setLoadingFolder(null)
    }
  }

  const toggleFileSelection = (file) => {
    setSelectedFiles(prev => {
      const exists = prev.find(f => f.path === file.path)
      if (exists) {
        return prev.filter(f => f.path !== file.path)
      }
      return [...prev, { ...file, type: 'github' }]
    })
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    const newProofs = files.map(file => ({
      name: file.name,
      type: 'upload',
      fileType: file.type,
      size: file.size,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      file: file
    }))
    setProofs(prev => [...prev, ...newProofs])
  }

  const removeProof = (index) => {
    setProofs(prev => prev.filter((_, i) => i !== index))
  }

  const addSelectedGitHubFiles = () => {
    const newProofs = selectedFiles.map(file => ({
      name: file.name,
      path: file.path,
      type: 'github',
      repo: githubConnection?.repo?.name || 'repository'
    }))
    setProofs(prev => [...prev, ...newProofs])
    setSelectedFiles([])
  }

  const handleSave = () => {
    onSave(proofs)
    onClose()
  }

  const getFileIcon = (file) => {
    if (file.type === 'github') return <FileCode className="w-4 h-4 text-blue-600" />
    if (file.fileType?.startsWith('image/')) return <Image className="w-4 h-4 text-green-600" />
    if (file.fileType?.includes('pdf')) return <FileText className="w-4 h-4 text-red-600" />
    return <File className="w-4 h-4 text-gray-600" />
  }

  const renderFolderContents = (items, level = 0) => {
    return items.map(item => (
      <div key={item.path} style={{ marginLeft: `${level * 16}px` }}>
        {item.type === 'dir' ? (
          <div>
            <button
              onClick={() => toggleFolder(item.path)}
              className="flex items-center space-x-2 w-full px-2 py-1.5 hover:bg-gray-100 rounded text-left"
            >
              {loadingFolder === item.path ? (
                <Loader className="w-4 h-4 animate-spin text-gray-400" />
              ) : expandedFolders[item.path] ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
              <Folder className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-700">{item.name}</span>
            </button>
            {expandedFolders[item.path] && (
              <div className="ml-2">
                {renderFolderContents(expandedFolders[item.path], level + 1)}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => toggleFileSelection(item)}
            className={`flex items-center space-x-2 w-full px-2 py-1.5 rounded text-left transition-colors ${
              selectedFiles.find(f => f.path === item.path)
                ? 'bg-primary-100 border border-primary-300'
                : 'hover:bg-gray-100'
            }`}
          >
            <div className="w-4 h-4 flex items-center justify-center">
              {selectedFiles.find(f => f.path === item.path) ? (
                <Check className="w-4 h-4 text-primary-600" />
              ) : (
                <div className="w-3 h-3 border border-gray-300 rounded" />
              )}
            </div>
            <FileCode className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-700">{item.name}</span>
          </button>
        )}
      </div>
    ))
  }

  if (!isOpen) return null

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
          className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-gray-100 flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Attach Proof of Work</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 mb-4 border-b border-gray-200">
            {skillCategory === 'coding' && githubConnection && (
              <button
                onClick={() => setActiveTab('github')}
                className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                  activeTab === 'github'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Github className="w-4 h-4" />
                <span>GitHub Files</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'upload'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Files</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* GitHub File Browser */}
            {activeTab === 'github' && githubConnection && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <Github className="w-4 h-4" />
                  <span>Browsing: <strong>{githubConnection.repo?.name || 'repository'}</strong></span>
                </div>

                <div className="border border-gray-200 rounded-lg p-3 max-h-64 overflow-y-auto">
                  {renderFolderContents(mockRepoStructure.root)}
                </div>

                {selectedFiles.length > 0 && (
                  <div className="flex items-center justify-between bg-primary-50 p-3 rounded-lg">
                    <span className="text-sm text-primary-700">
                      {selectedFiles.length} file(s) selected
                    </span>
                    <button
                      onClick={addSelectedGitHubFiles}
                      className="btn-primary text-sm py-1.5 px-4"
                    >
                      Add Selected
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* File Upload */}
            {activeTab === 'upload' && (
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors"
                >
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">PDF, Images, Documents (Max 10MB)</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}

            {/* Attached Proofs */}
            {proofs.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Attached Files ({proofs.length})
                </h3>
                <div className="space-y-2">
                  {proofs.map((proof, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getFileIcon(proof)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{proof.name}</p>
                          <p className="text-xs text-gray-500">
                            {proof.type === 'github' ? (
                              <span className="flex items-center">
                                <Github className="w-3 h-3 mr-1" />
                                {proof.repo}/{proof.path}
                              </span>
                            ) : (
                              `Uploaded • ${(proof.size / 1024).toFixed(1)} KB`
                            )}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeProof(index)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button onClick={handleSave} className="flex-1 btn-primary">
              Save Proof of Work
            </button>
            <button onClick={onClose} className="btn-secondary px-6">
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ProofOfWork
