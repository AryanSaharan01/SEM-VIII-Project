import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, FileText, Loader, Calendar, Target, Paperclip, Github, Upload, Folder, ChevronRight, ChevronDown, File, Image, Trash2, AlertCircle } from 'lucide-react'
import { getGitHubTree } from '../../services/api'
import { useDebouncedCallback } from '../../utils/hooks'

const SessionLogger = ({ onClose, onSubmit, skills, selectedSkillId, githubConnected = false, availableRepos = [] }) => {
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
  const [repoTree, setRepoTree] = useState([])
  const [treeLoading, setTreeLoading] = useState(false)
  const [treeError, setTreeError] = useState('')
  const [selectedRepoForTree, setSelectedRepoForTree] = useState(null)
  const fileInputRef = useRef(null)

  const difficultyLevels = [
    { value: 'easy', label: 'Easy', color: 'bg-green-500/10 text-green-400 border-green-500/30', emoji: '😊' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', emoji: '🤔' },
    { value: 'hard', label: 'Hard', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30', emoji: '😰' },
    { value: 'expert', label: 'Expert', color: 'bg-red-500/10 text-red-400 border-red-500/30', emoji: '🔥' }
  ]

  // Get the selected skill and check if it's a coding skill with linked repo
  const selectedSkill = skills?.find(s => s.id === formData.skillId)
  const isCodingSkill = selectedSkill?.category === 'coding'

  // Build a linkedRepo object from the skill's stored data.
  // linked_repo_id is stored as full_name ("owner/repo") — fall back to matching availableRepos by name.
  const linkedRepo = (() => {
    if (!selectedSkill) return null
    const storedId = selectedSkill.linked_repo_id
    if (!storedId) return null
    // Preferred: full_name format "owner/repo" contains a slash
    if (storedId.includes('/')) {
      return {
        full_name: storedId,
        name: selectedSkill.linked_repo_name || storedId.split('/')[1],
        id: storedId,
      }
    }
    // Legacy: numeric ID — try to find match in availableRepos
    const match = availableRepos.find(r => String(r.id) === String(storedId) || r.name === selectedSkill.linked_repo_name)
    if (match) return match
    // Fallback: use repo name alone (won't be able to split owner)
    return selectedSkill.linked_repo_name
      ? { full_name: null, name: selectedSkill.linked_repo_name, id: storedId }
      : null
  })()

  // When a repo is selected for file browsing, load its tree
  const loadRepoTree = async (repo) => {
    if (!repo?.full_name) {
      setTreeError('Cannot load repo: missing full repository name (owner/repo). Try relinking the repo to this skill.')
      return
    }
    const [owner, repoName] = repo.full_name.split('/')
    if (!owner || !repoName) {
      setTreeError('Invalid repository name format. Please re-link the repository.')
      return
    }
    setTreeLoading(true)
    setTreeError('')
    setRepoTree([])
    setExpandedFolders({})
    try {
      const data = await getGitHubTree(owner, repoName)
      setRepoTree(data.tree || [])
    } catch (err) {
      setTreeError('Failed to load file tree. Please try again.')
    } finally {
      setTreeLoading(false)
    }
  }

  // Auto-load tree for coding skills with GitHub connected
  useEffect(() => {
    if (!isCodingSkill || !githubConnected) return
    const repo = linkedRepo || (availableRepos.length > 0 ? availableRepos[0] : null)
    if (!repo) return
    const targetId = repo.full_name || repo.id
    if (!selectedRepoForTree || (selectedRepoForTree.full_name || selectedRepoForTree.id) !== targetId) {
      setSelectedRepoForTree(repo)
      loadRepoTree(repo)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.skillId, isCodingSkill, githubConnected, linkedRepo?.full_name, availableRepos.length])

  const toggleFolder = (path) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }))
  }

  const toggleGitHubFileSelection = (file) => {
    setSelectedGitHubFiles(prev => {
      const isSelected = prev.some(f => f.path === file.path)
      if (isSelected) return prev.filter(f => f.path !== file.path)
      return [...prev, { ...file, type: 'github', repoName: selectedRepoForTree?.full_name || selectedRepoForTree?.name }]
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
      debouncedClearError(field)
    }
  }

  const debouncedClearError = useDebouncedCallback((field) => {
    setErrors(prev => ({ ...prev, [field]: '' }))
  }, 300)

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
        className="fixed inset-0 bg-black/70 backdrop-blur-xl z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-card glass-glow rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/40"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Log Learning Session</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Skill Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Select Skill *
              </label>
              <select
                value={formData.skillId || ''}
                onChange={(e) => handleChange('skillId', parseInt(e.target.value))}
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-white ${
                  errors.skill ? 'border-red-500' : 'border-white/10 hover:border-white/20'
                }`}
              >
                <option value="" className="bg-gray-900">Choose a skill...</option>
                {skills && skills.map(skill => (
                  <option key={skill.id} value={skill.id} className="bg-gray-900">
                    {skill.name} ({skill.category})
                  </option>
                ))}
              </select>
              {errors.skill && (
                <p className="text-red-400 text-sm mt-1">{errors.skill}</p>
              )}
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Topic / What did you learn? *
              </label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => handleChange('topic', e.target.value)}
                placeholder="e.g., React Hooks - useEffect cleanup"
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-white placeholder-gray-500 ${
                  errors.topic ? 'border-red-500' : 'border-white/10 hover:border-white/20'
                }`}
              />
              {errors.topic && (
                <p className="text-red-400 text-sm mt-1">{errors.topic}</p>
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
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
                className="w-full h-2 bg-white/10 rounded-xl appearance-none cursor-pointer accent-primary-600"
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
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Session Date & Time
              </label>
              <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 font-mono">
                {currentDateTime} (Auto-generated)
              </div>
              <p className="text-xs text-gray-500 mt-1">Timestamp is automatically set when you submit</p>
            </div>

            {/* Difficulty Level */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                <Target className="w-4 h-4 inline mr-1" />
                Difficulty Level *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {difficultyLevels.map(level => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => handleChange('difficulty', level.value)}
                    className={`px-4 py-3 rounded-xl border-2 font-medium transition-all duration-300 ${
                      formData.difficulty === level.value
                        ? level.color + ' border-current scale-105 shadow-md'
                        : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'
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
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Reflection Notes *
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Describe what you learned, challenges you faced, key insights, code snippets, breakthroughs, etc. Be detailed - this builds your credibility and helps track your learning journey."
                rows={10}
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none text-white placeholder-gray-500 ${
                  errors.notes ? 'border-red-500' : 'border-white/10 hover:border-white/20'
                }`}
              />
              <div className="flex justify-between items-center mt-2">
                {errors.notes ? (
                  <p className="text-red-400 text-sm">{errors.notes}</p>
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
            <div className="glass rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-300">
                  <p className="font-semibold text-primary-400 mb-1">💡 Pro Tips for Better Notes</p>
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
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                <Paperclip className="w-4 h-4 inline mr-1" />
                Proof of Work (Optional)
              </label>

              {/* Coding skill + GitHub connected: show repo file browser */}
              {isCodingSkill && githubConnected ? (
                <div className="space-y-4">
                  {/* Repo selector (if skill has no linked repo, let user pick from available repos) */}
                  {!linkedRepo && availableRepos.length > 0 && (
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Select repository to browse:</label>
                      <select
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:ring-2 focus:ring-primary-500 outline-none"
                        value={selectedRepoForTree?.full_name || ''}
                        onChange={(e) => {
                          const repo = availableRepos.find(r => r.full_name === e.target.value)
                          if (repo) { setSelectedRepoForTree(repo); loadRepoTree(repo) }
                        }}
                      >
                        <option value="" className="bg-gray-900">-- Choose a repo --</option>
                        {availableRepos.map(r => (
                          <option key={r.id} value={r.full_name} className="bg-gray-900">{r.full_name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedRepoForTree && (
                    <div className="glass rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Github className="w-5 h-5 text-gray-300" />
                        <span className="font-medium text-white">{selectedRepoForTree.name || selectedRepoForTree.full_name}</span>
                        <span className="text-xs text-gray-500">• Select files as proof</span>
                      </div>

                      {treeLoading ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader className="w-5 h-5 animate-spin text-gray-400 mr-2" />
                          <span className="text-sm text-gray-500">Loading files...</span>
                        </div>
                      ) : treeError ? (
                        <div className="flex items-center space-x-2 text-red-600 text-sm py-2">
                          <AlertCircle className="w-4 h-4" />
                          <span>{treeError}</span>
                        </div>
                      ) : (
                        <div className="max-h-48 overflow-y-auto border border-white/10 rounded-lg bg-white/5">
                          {renderFileTree(repoTree)}
                        </div>
                      )}
                    </div>
                  )}

                  {!selectedRepoForTree && !linkedRepo && availableRepos.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No repositories selected. Open <strong>GitHub Integration</strong> from the sidebar to select repositories.
                    </p>
                  )}

                  {/* Selected GitHub Files */}
                  {selectedGitHubFiles.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Selected files ({selectedGitHubFiles.length}):</p>
                      <div className="space-y-1">
                        {selectedGitHubFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
                            <div className="flex items-center space-x-2 min-w-0">
                              <Github className="w-4 h-4 text-blue-400 flex-shrink-0" />
                              <span className="text-sm text-gray-300 truncate">{file.path}</span>
                            </div>
                            <button type="button" onClick={() => removeGitHubFile(file.path)} className="text-gray-400 hover:text-red-500 flex-shrink-0 ml-2">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Non-coding skill or GitHub not connected: file upload */
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
                    className="w-full border-2 border-dashed border-white/10 rounded-2xl p-6 text-center hover:border-primary-500/40 hover:bg-primary-500/5 transition-all duration-300"
                  >
                    <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Click to upload files</p>
                    <p className="text-xs text-gray-500 mt-1">PDF, Images, Documents (max 10MB each)</p>
                  </button>

                  {/* Uploaded Files */}
                  {uploadedFiles.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Uploaded files ({uploadedFiles.length}):</p>
                      <div className="space-y-1">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                            <div className="flex items-center space-x-2">
                              {file.fileType?.startsWith('image/') ? (
                                <Image className="w-4 h-4 text-green-600" />
                              ) : (
                                <FileText className="w-4 h-4 text-green-600" />
                              )}
                              <span className="text-sm text-gray-300">{file.name}</span>
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

                  {isCodingSkill && !githubConnected && (
                    <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                      💡 Tip: Connect GitHub from the sidebar to select code files as proof of work
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
                  <><Loader className="w-5 h-5 animate-spin" /><span>Logging Session...</span></>
                ) : (
                  <><Clock className="w-5 h-5" /><span>Log Session</span></>
                )}
              </button>
              <button type="button" onClick={onClose} className="btn-secondary px-8">
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )

  // Render the already-nested tree returned by the API backend.
  // The backend builds a nested structure (each dir node has a `children` array),
  // so we just recurse into it directly — no re-flattening needed.
  function renderFileTree(items) {
    if (!items || items.length === 0) return <p className="text-xs text-gray-400 p-3">No files found.</p>

    const renderNode = (node, depth = 0) => {
      const isSelected = selectedGitHubFiles.some(f => f.path === node.path)
      const indent = depth * 16

      if (node.type === 'dir') {
        const isOpen = !!expandedFolders[node.path]
        const hasChildren = node.children && node.children.length > 0
        return (
          <div key={node.path}>
            <button
              type="button"
              onClick={() => toggleFolder(node.path)}
              className="w-full flex items-center space-x-2 px-3 py-1.5 hover:bg-white/5 text-left rounded"
              style={{ paddingLeft: `${12 + indent}px` }}
            >
              {isOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              )}
              <Folder className={`w-4 h-4 flex-shrink-0 ${isOpen ? 'text-yellow-400' : 'text-yellow-500/70'}`} />
              <span className="text-gray-300 text-sm truncate">{node.name}</span>
              {hasChildren && (
                <span className="ml-auto text-gray-600 text-xs flex-shrink-0">{node.children.length}</span>
              )}
            </button>
            {isOpen && hasChildren && (
              <div>
                {node.children.map(child => renderNode(child, depth + 1))}
              </div>
            )}
            {isOpen && !hasChildren && (
              <p className="text-xs text-gray-600 italic py-1" style={{ paddingLeft: `${28 + indent}px` }}>
                Empty folder
              </p>
            )}
          </div>
        )
      }

      // File node
      return (
        <button
          key={node.path}
          type="button"
          onClick={() => toggleGitHubFileSelection(node)}
          className={`w-full flex items-center space-x-2 py-1.5 rounded text-left transition-colors ${
            isSelected
              ? 'bg-primary-500/15 text-primary-300'
              : 'hover:bg-white/5 text-gray-300'
          }`}
          style={{ paddingLeft: `${28 + indent}px`, paddingRight: '12px' }}
        >
          <File className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-primary-400' : 'text-gray-500'}`} />
          <span className={`text-sm truncate flex-1 ${isSelected ? 'font-medium' : ''}`}>
            {node.name}
          </span>
          {isSelected && (
            <span className="text-primary-400 text-xs flex-shrink-0">✓</span>
          )}
        </button>
      )
    }

    return <div className="text-sm py-1">{items.map(node => renderNode(node, 0))}</div>
  }
}

export default SessionLogger
