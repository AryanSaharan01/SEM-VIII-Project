import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Code, FileText, TrendingUp, Trash2, AlertTriangle, Loader } from 'lucide-react'
import { getScoreLabel } from '../../utils/helpers'

const SkillCard = ({ skill, isSelected, onClick, onDelete }) => {
  const { label, color, bg } = getScoreLabel(skill.score)
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const canDelete = (skill.totalSessions ?? skill.total_sessions ?? 0) === 0

  const handleDeleteClick = (e) => {
    e.stopPropagation()
    setError('')
    setShowConfirm(true)
  }

  const handleConfirmDelete = async (e) => {
    e.stopPropagation()
    setDeleting(true)
    setError('')
    try {
      await onDelete(skill.id)
    } catch (err) {
      setError(err.message || 'Failed to delete')
      setDeleting(false)
    }
  }

  const handleCancelDelete = (e) => {
    e.stopPropagation()
    setShowConfirm(false)
    setError('')
  }

  return (
    <div className="relative group">
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`w-full text-left p-4 rounded-2xl transition-all duration-300 ${
          isSelected
            ? 'glass-card glass-glow border border-primary-500/30'
            : 'glass border border-white/[0.06] hover:border-primary-500/15 hover:bg-white/[0.03]'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {skill.category === 'coding' ? (
              <Code className="w-4 h-4 text-primary-400 flex-shrink-0" />
            ) : (
              <FileText className="w-4 h-4 text-violet-400 flex-shrink-0" />
            )}
            <h3 className="font-semibold text-white text-sm truncate">{skill.name}</h3>
          </div>
          <div className={`${bg} ${color} px-2.5 py-0.5 rounded-lg text-xs font-bold flex-shrink-0 ml-2`}>
            {skill.score}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            <span>{skill.totalSessions ?? skill.total_sessions ?? 0} sessions</span>
            <span>{skill.totalHours ?? 0}h</span>
          </div>
          <span className="flex items-center text-gray-600">
            <TrendingUp className="w-3 h-3 mr-1" />
            {label}
          </span>
        </div>
      </motion.button>

      {/* Delete button — visible on hover, only if 0 sessions */}
      {canDelete && !showConfirm && (
        <button
          onClick={handleDeleteClick}
          title="Delete skill"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Inline confirmation */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 glass-card border border-red-500/20 rounded-2xl p-3 z-10 flex flex-col justify-between shadow-lg shadow-red-500/10"
          >
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-200 font-medium">
                Delete <span className="font-bold text-red-400">"{skill.name}"</span>? This cannot be undone.
              </p>
            </div>
            {error && (
              <p className="text-xs text-red-400 mt-1">{error}</p>
            )}
            <div className="flex space-x-2 mt-2">
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 flex items-center justify-center space-x-1 bg-red-600 hover:bg-red-700 text-white text-xs py-1.5 rounded-md transition-colors"
              >
                {deleting ? <Loader className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                <span>{deleting ? 'Deleting...' : 'Delete'}</span>
              </button>
              <button
                onClick={handleCancelDelete}
                className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 text-xs py-1.5 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SkillCard
