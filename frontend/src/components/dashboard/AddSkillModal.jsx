import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Code, FileText, Palette, Music, Dumbbell, Loader, Github, CheckCircle } from 'lucide-react'

const AddSkillModal = ({ isOpen, onClose, onAdd, connectedRepos = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'coding',
    linkedRepo: null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const categories = [
    { value: 'coding', label: 'Coding', icon: Code, color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    { value: 'writing', label: 'Writing', icon: FileText, color: 'bg-green-500/10 text-green-400 border-green-500/30' },
    // { value: 'design', label: 'Design', icon: Palette, color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
    // { value: 'music', label: 'Music', icon: Music, color: 'bg-pink-500/10 text-pink-400 border-pink-500/30' },
    // { value: 'fitness', label: 'Fitness', icon: Dumbbell, color: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
    { value: 'other', label: 'Other', icon: Plus, color: 'bg-white/5 text-gray-400 border-white/10' }
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
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-card glass-glow rounded-2xl p-8 max-w-md w-full max-h-[85vh] overflow-y-auto shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Add New Skill</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Skill Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Skill Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., React Development, Spanish Language, Guitar"
                className={`w-full px-4 py-3 bg-white/5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all text-white placeholder-gray-500 ${
                  error ? 'border-red-500' : 'border-white/10'
                }`}
                autoFocus
              />
              {error && (
                <p className="text-red-400 text-sm mt-1">{error}</p>
              )}
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Category *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map(cat => {
                  const Icon = cat.icon
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => handleCategoryChange(cat.value)}
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition-all flex items-center justify-center space-x-2 ${
                        formData.category === cat.value
                          ? cat.color + ' border-current scale-105 shadow-md'
                          : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{cat.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* GitHub Repo Selection (for coding skills only) */}
            {isCodingCategory && (
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  <Github className="w-4 h-4 inline mr-1" />
                  Link GitHub Repository (Optional)
                </label>
                {connectedRepos.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, linkedRepo: null })}
                      className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${
                        !formData.linkedRepo
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <span className="text-gray-400">No repository linked</span>
                    </button>
                    {connectedRepos.map(repo => (
                      <button
                        key={repo.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, linkedRepo: repo })}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          formData.linkedRepo?.id === repo.id
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Github className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-white">{repo.name}</span>
                            {repo.private && <span className="text-xs text-amber-600">(private)</span>}
                          </div>
                          {formData.linkedRepo?.id === repo.id && (
                            <CheckCircle className="w-4 h-4 text-primary-600" />
                          )}
                        </div>
                        {repo.language && (
                          <p className="text-xs text-gray-500 mt-1">{repo.language}</p>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="glass rounded-xl p-4 text-center">
                    <Github className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No GitHub repos connected</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Connect repos from the sidebar to link them to skills
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Info */}
            <div className="glass rounded-xl p-4">
              <p className="text-sm text-gray-300">
                <strong className="text-primary-400">💡 Tip:</strong> Choose a specific skill you want to track. 
                You'll be able to log learning sessions and build a verifiable record of your progress.
              </p>
            </div>

            {/* Submit */}
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary flex items-center justify-center space-x-2"
              >
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
}

export default AddSkillModal
