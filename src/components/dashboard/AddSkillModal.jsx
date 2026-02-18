import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Code, FileText, Palette, Music, Dumbbell, Loader, Github, CheckCircle, Sparkles } from 'lucide-react'

const AddSkillModal = ({ isOpen, onClose, onAdd, connectedRepos = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'coding',
    linkedRepo: null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const categories = [
    { value: 'coding', label: 'Coding', icon: Code, color: 'bg-primary-100 text-primary-700 border-primary-300 hover:bg-primary-200' },
    { value: 'writing', label: 'Writing', icon: FileText, color: 'bg-success-100 text-success-700 border-success-300 hover:bg-success-200' },
    { value: 'other', label: 'Other', icon: Plus, color: 'bg-neutral-100 text-neutral-700 border-neutral-300 hover:bg-neutral-200' }
  ]

  const isCodingCategory = formData.category === 'coding'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Skill name is required')
      return
    }

    if (formData.name.length < 3) {
      setError('Skill name must be at least 3 characters')
      return
    }

    setLoading(true)
    try {
      await onAdd(formData)
      setFormData({ name: '', category: 'coding', linkedRepo: null })
      onClose()
    } catch (err) {
      setError('Failed to add skill. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (category) => {
    setFormData({ 
      ...formData, 
      category, 
      linkedRepo: category === 'coding' ? formData.linkedRepo : null 
    })
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl border border-gray-200 relative max-h-[85vh] overflow-y-auto custom-scrollbar"
        >
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Add New Skill</h2>
              <p className="text-sm text-gray-500 mt-1">Start tracking your learning journey</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Skill Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Skill Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., React Development, Spanish Language"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all ${
                  error ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300 focus:border-primary-500'
                }`}
                autoFocus
              />
              <AnimatePresence>
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-600 text-sm mt-2"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Category *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {categories.map(cat => {
                  const Icon = cat.icon
                  const isSelected = formData.category === cat.value
                  return (
                    <motion.button
                      key={cat.value}
                      type="button"
                      onClick={() => handleCategoryChange(cat.value)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition-all duration-200 flex flex-col items-center justify-center space-y-1 ${
                        isSelected
                          ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-md'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{cat.label}</span>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* GitHub Repo Selection (for coding skills only) */}
            <AnimatePresence mode="wait">
              {isCodingCategory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Github className="w-4 h-4 mr-2" />
                    Link GitHub Repository (Optional)
                  </label>
                  {connectedRepos.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                      <motion.button
                        type="button"
                        onClick={() => setFormData({ ...formData, linkedRepo: null })}
                        whileHover={{ scale: 1.01 }}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all text-sm ${
                          !formData.linkedRepo
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <span className="text-gray-700">No repository linked</span>
                      </motion.button>
                      {connectedRepos.map(repo => (
                        <motion.button
                          key={repo.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, linkedRepo: repo })}
                          whileHover={{ scale: 1.01 }}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                            formData.linkedRepo?.id === repo.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Github className="w-4 h-4 text-gray-600" />
                              <div>
                                <span className="font-medium text-gray-900 block text-sm">{repo.name}</span>
                                <span className="text-xs text-gray-500">{repo.language}</span>
                              </div>
                            </div>
                            {formData.linkedRepo?.id === repo.id && (
                              <CheckCircle className="w-4 h-4 text-primary-600" />
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <Github className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700">No GitHub repos connected</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Connect repos from the sidebar
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong className="text-blue-900">💡 Tip:</strong> Choose a specific skill you want to track. 
                You'll be able to log learning sessions and build a verifiable record.
              </p>
            </div>

            {/* Submit */}
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center space-x-2">
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>Add Skill</span>
                    </>
                  )}
                </span>
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AddSkillModal
