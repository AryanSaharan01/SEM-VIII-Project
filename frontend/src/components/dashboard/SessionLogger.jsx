import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, FileText, Loader, Calendar, Target, Paperclip, Github, Upload, Folder, ChevronRight, ChevronDown, File, Image, Trash2 } from 'lucide-react'

const SessionLogger = ({ onClose, onSubmit, skills, selectedSkillId, connectedRepos = [] }) => {
  const [formData, setFormData] = useState({
    skillId: selectedSkillId || (skills && skills.length > 0 ? skills[0].id : null),
    topic: '',
    notes: '',
    durationSeconds: 1800,
    difficulty: 'medium',
    clientTs: new Date().toISOString(),
    proofOfWork: []
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showProofOfWork, setShowProofOfWork] = useState(false)
  const [expandedFolders, setExpandedFolders] = useState({})
  const [selectedGitHubFiles, setSelectedGitHubFiles] = useState([])
  const [uploadedFiles, setUploadedFiles] = useState([])
  const fileInputRef = useRef(null)

  const difficultyLevels = [
    { value: 'easy', label: 'Easy', color: 'bg-green-100 text-green-700 border-green-300', emoji: '😊' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', emoji: '🤔' },
    { value: 'hard', label: 'Hard', color: 'bg-orange-100 text-orange-700 border-orange-300', emoji: '😰' },
    { value: 'expert', label: 'Expert', color: 'bg-red-100 text-red-700 border-red-300', emoji: '🔥' }
  ]

  // Get the selected skill and check if it's a coding skill with linked repo
  const selectedSkill = skills?.find(s => s.id === formData.skillId)
  const isCodingSkill = selectedSkill?.category === 'coding'
  const linkedRepo = selectedSkill?.linkedRepo

  // Mock file structure for repos
  const mockRepoFiles = {
    'src': [
      { name: 'components', type: 'dir', path: 'src/components' },
      { name: 'pages', type: 'dir', path: 'src/pages' },
      { name: 'utils', type: 'dir', path: 'src/utils' },
      { name: 'App.jsx', type: 'file', path: 'src/App.jsx' },
      { name: 'index.js', type: 'file', path: 'src/index.js' },
      { name: 'styles.css', type: 'file', path: 'src/styles.css' },
    ],
    'src/components': [
      { name: 'Header.jsx', type: 'file', path: 'src/components/Header.jsx' },
      { name: 'Footer.jsx', type: 'file', path: 'src/components/Footer.jsx' },
      { name: 'Sidebar.jsx', type: 'file', path: 'src/components/Sidebar.jsx' },
      { name: 'Card.jsx', type: 'file', path: 'src/components/Card.jsx' },
    ],
    'src/pages': [
      { name: 'Home.jsx', type: 'file', path: 'src/pages/Home.jsx' },
      { name: 'Dashboard.jsx', type: 'file', path: 'src/pages/Dashboard.jsx' },
      { name: 'Profile.jsx', type: 'file', path: 'src/pages/Profile.jsx' },
    ],
    'src/utils': [
      { name: 'helpers.js', type: 'file', path: 'src/utils/helpers.js' },
      { name: 'api.js', type: 'file', path: 'src/utils/api.js' },
    ],
    'root': [
      { name: 'src', type: 'dir', path: 'src' },
      { name: 'public', type: 'dir', path: 'public' },
      { name: 'package.json', type: 'file', path: 'package.json' },
      { name: 'README.md', type: 'file', path: 'README.md' },
      { name: 'vite.config.js', type: 'file', path: 'vite.config.js' },
    ]
  }

  const toggleFolder = (path) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }))
  }

  const toggleGitHubFileSelection = (file) => {
    setSelectedGitHubFiles(prev => {
      const isSelected = prev.some(f => f.path === file.path)
      if (isSelected) {
        return prev.filter(f => f.path !== file.path)
      } else {
        return [...prev, { ...file, type: 'github', repoName: linkedRepo?.name }]
      }
    })
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    const newFiles = files.map(file => ({
      name: file.name,
      size: file.size,
      type: 'upload',
      fileType: file.type,
      file: file
    }))
    setUploadedFiles(prev => [...prev, ...newFiles])
  }

  const removeUploadedFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const removeGitHubFile = (path) => {
    setSelectedGitHubFiles(prev => prev.filter(f => f.path !== path))
  }

  const handleProofOfWorkChange = (files) => {
    setFormData(prev => ({ ...prev, proofOfWork: files }))
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.skillId) newErrors.skill = 'Please select a skill'
    if (!formData.topic.trim()) newErrors.topic = 'Topic is required'
    if (!formData.notes.trim()) newErrors.notes = 'Notes are required'
    if (formData.notes.trim().length < 20) newErrors.notes = 'Notes should be at least 20 characters'
    if (formData.durationSeconds < 60) newErrors.duration = 'Duration must be at least 1 minute'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validate()
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      // Combine all proof of work files
      const allProofOfWork = [
        ...selectedGitHubFiles,
        ...uploadedFiles.map(f => ({ name: f.name, type: 'upload', fileType: f.fileType }))
      ]
      
      // Update timestamp to current time when submitting
      const submitData = {
        ...formData,
        clientTs: new Date().toISOString(),
        proofOfWork: allProofOfWork
      }
      await onSubmit(submitData)
    } catch (error) {
      console.error('Failed to create session:', error)
    } finally {
      setLoading(false)
    }
  }

  const durationMinutes = Math.floor(formData.durationSeconds / 60)
  const currentDateTime = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

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
          className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Log Learning Session</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Skill Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Skill *
              </label>
              <select
                value={formData.skillId || ''}
                onChange={(e) => handleChange('skillId', parseInt(e.target.value))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all ${
                  errors.skill ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Choose a skill...</option>
                {skills && skills.map(skill => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name} ({skill.category})
                  </option>
                ))}
              </select>
              {errors.skill && (
                <p className="text-red-600 text-sm mt-1">{errors.skill}</p>
              )}
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Topic / What did you learn? *
              </label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => handleChange('topic', e.target.value)}
                placeholder="e.g., React Hooks - useEffect cleanup"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all ${
                  errors.topic ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.topic && (
                <p className="text-red-600 text-sm mt-1">{errors.topic}</p>
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Time Invested: {durationMinutes} minutes ({Math.round(durationMinutes / 60)} hours)
              </label>
              <input
                type="range"
                min="5"
                max="480"
                step="5"
                value={durationMinutes}
                onChange={(e) => handleChange('durationSeconds', parseInt(e.target.value) * 60)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5 min</span>
                <span>1 hr</span>
                <span>2 hrs</span>
                <span>4 hrs</span>
                <span>8 hrs</span>
              </div>
            </div>

            {/* Date & Time (Auto-generated, display only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Session Date & Time
              </label>
              <div className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-mono">
                {currentDateTime} (Auto-generated)
              </div>
              <p className="text-xs text-gray-500 mt-1">Timestamp is automatically set when you submit</p>
            </div>

            {/* Difficulty Level */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <Target className="w-4 h-4 inline mr-1" />
                Difficulty Level *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {difficultyLevels.map(level => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => handleChange('difficulty', level.value)}
                    className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                      formData.difficulty === level.value
                        ? level.color + ' border-current scale-105 shadow-md'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <span className="text-xl mr-1">{level.emoji}</span>
                    <span className="text-sm">{level.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Reflection Notes *
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Describe what you learned, challenges you faced, key insights, code snippets, breakthroughs, etc. Be detailed - this builds your credibility and helps track your learning journey."
                rows={10}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none ${
                  errors.notes ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <div className="flex justify-between items-center mt-2">
                {errors.notes ? (
                  <p className="text-red-600 text-sm">{errors.notes}</p>
                ) : (
                  <p className="text-gray-500 text-sm">
                    {formData.notes.length} characters
                    {formData.notes.length < 20 && ' (minimum 20)'}
                  </p>
                )}
                <span className={`text-xs font-medium ${
                  formData.notes.length >= 100 ? 'text-green-600' : 
                  formData.notes.length >= 50 ? 'text-yellow-600' : 'text-gray-400'
                }`}>
                  {formData.notes.length >= 100 ? '✓ Excellent detail!' : 
                   formData.notes.length >= 50 ? 'Good, add more!' : 'Keep writing...'}
                </span>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-700">
                  <p className="font-semibold text-primary-900 mb-1">💡 Pro Tips for Better Notes</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Mention specific concepts, functions, or techniques you learned</li>
                    <li>Describe what confused you and how you overcame it</li>
                    <li>Include code snippets or examples (increases authenticity)</li>
                    <li>Note any "aha!" moments or breakthroughs</li>
                    <li>Reference external resources or documentation you used</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Proof of Work Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <Paperclip className="w-4 h-4 inline mr-1" />
                Proof of Work (Optional)
              </label>
              
              {/* For Coding Skills with Linked Repo - Show GitHub File Browser */}
              {isCodingSkill && linkedRepo ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Github className="w-5 h-5 text-gray-700" />
                      <span className="font-medium text-gray-900">{linkedRepo.name}</span>
                      <span className="text-xs text-gray-500">• Select files as proof</span>
                    </div>
                    
                    {/* File Tree */}
                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                      {renderFileTree(mockRepoFiles['root'], '')}
                    </div>
                  </div>

                  {/* Selected GitHub Files */}
                  {selectedGitHubFiles.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-600 mb-2">Selected files ({selectedGitHubFiles.length}):</p>
                      <div className="space-y-1">
                        {selectedGitHubFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                            <div className="flex items-center space-x-2">
                              <Github className="w-4 h-4 text-blue-600" />
                              <span className="text-sm text-gray-800">{file.path}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeGitHubFile(file.path)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* For Non-Coding Skills or Coding Skills without Linked Repo - Show File Upload */
                <div className="space-y-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.gif,.doc,.docx,.txt,.md"
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 hover:bg-primary-50 transition-all"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload files
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, Images, Documents (max 10MB each)
                    </p>
                  </button>

                  {/* Uploaded Files */}
                  {uploadedFiles.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-600 mb-2">Uploaded files ({uploadedFiles.length}):</p>
                      <div className="space-y-1">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                            <div className="flex items-center space-x-2">
                              {file.fileType?.startsWith('image/') ? (
                                <Image className="w-4 h-4 text-green-600" />
                              ) : (
                                <FileText className="w-4 h-4 text-green-600" />
                              )}
                              <span className="text-sm text-gray-800">{file.name}</span>
                              <span className="text-xs text-gray-500">
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeUploadedFile(index)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {isCodingSkill && !linkedRepo && (
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                      💡 Tip: Link a GitHub repository to this skill to select code files as proof of work
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Logging Session...</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5" />
                    <span>Log Session</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary px-8"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )

  // Helper function to render file tree
  function renderFileTree(items, parentPath) {
    return (
      <div className="text-sm">
        {items.map((item) => (
          <div key={item.path}>
            {item.type === 'dir' ? (
              <div>
                <button
                  type="button"
                  onClick={() => toggleFolder(item.path)}
                  className="w-full flex items-center space-x-2 px-3 py-1.5 hover:bg-gray-50 text-left"
                >
                  {expandedFolders[item.path] ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                  <Folder className="w-4 h-4 text-yellow-500" />
                  <span className="text-gray-700">{item.name}</span>
                </button>
                {expandedFolders[item.path] && mockRepoFiles[item.path] && (
                  <div className="ml-4">
                    {renderFileTree(mockRepoFiles[item.path], item.path)}
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => toggleGitHubFileSelection(item)}
                className={`w-full flex items-center space-x-2 px-3 py-1.5 hover:bg-gray-50 text-left ${
                  selectedGitHubFiles.some(f => f.path === item.path) ? 'bg-blue-50' : ''
                }`}
              >
                <span className="w-4" />
                <File className={`w-4 h-4 ${
                  selectedGitHubFiles.some(f => f.path === item.path) ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <span className={`${
                  selectedGitHubFiles.some(f => f.path === item.path) ? 'text-blue-700 font-medium' : 'text-gray-700'
                }`}>{item.name}</span>
                {selectedGitHubFiles.some(f => f.path === item.path) && (
                  <span className="ml-auto text-blue-600 text-xs">✓</span>
                )}
              </button>
            )}
          </div>
        ))}
      </div>
    )
  }
}

export default SessionLogger
