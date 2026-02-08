import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, FileText, Loader, Calendar, Target } from 'lucide-react'

const SessionLogger = ({ onClose, onSubmit, skills, selectedSkillId }) => {
  const [formData, setFormData] = useState({
    skillId: selectedSkillId || (skills && skills.length > 0 ? skills[0].id : null),
    topic: '',
    notes: '',
    durationSeconds: 1800,
    difficulty: 'medium',
    clientTs: new Date().toISOString()
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const difficultyLevels = [
    { value: 'easy', label: 'Easy', color: 'bg-green-100 text-green-700 border-green-300', emoji: '😊' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', emoji: '🤔' },
    { value: 'hard', label: 'Hard', color: 'bg-orange-100 text-orange-700 border-orange-300', emoji: '😰' },
    { value: 'expert', label: 'Expert', color: 'bg-red-100 text-red-700 border-red-300', emoji: '🔥' }
  ]

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
      // Update timestamp to current time when submitting
      const submitData = {
        ...formData,
        clientTs: new Date().toISOString()
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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-card rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
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
}

export default SessionLogger
