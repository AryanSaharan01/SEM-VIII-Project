import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Clock, Calendar, Lock, Shield, Github, 
  FileText, Image, FileCode, ExternalLink, Download,
  ChevronRight, Hash, Link2
} from 'lucide-react'
import { formatDate, formatDuration, getPhaseColor } from '../../utils/helpers'

const SessionDetail = ({ onClose, session }) => {
  if (!session) return null

  const getFileIcon = (proof) => {
    if (proof.type === 'github') return <FileCode className="w-5 h-5 text-blue-600" />
    if (proof.fileType?.startsWith('image/')) return <Image className="w-5 h-5 text-green-600" />
    if (proof.fileType?.includes('pdf')) return <FileText className="w-5 h-5 text-red-600" />
    return <FileText className="w-5 h-5 text-gray-600" />
  }

  const getDifficultyStyle = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-300'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'hard': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'expert': return 'bg-red-100 text-red-700 border-red-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
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
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-100 flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-purple-50">
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{session.topic}</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1.5" />
                    {formatDate(session.clientTs)}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1.5" />
                    {formatDuration(session.durationSeconds)}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Notes Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                Session Notes
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {session.notes}
                </p>
              </div>
            </div>

            {/* Proof of Work Section */}
            {session.proofs && session.proofs.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                  Proof of Work ({session.proofs.length} files)
                </h3>
                <div className="space-y-2">
                  {session.proofs.map((proof, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-3">
                        {getFileIcon(proof)}
                        <div>
                          <p className="font-medium text-gray-900">{proof.name}</p>
                          <p className="text-xs text-gray-500">
                            {proof.type === 'github' ? (
                              <span className="flex items-center">
                                <Github className="w-3 h-3 mr-1" />
                                {proof.repo}/{proof.path}
                              </span>
                            ) : (
                              `Uploaded file • ${proof.fileType || 'document'}`
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {proof.type === 'github' && (
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verification Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                Blockchain Verification
              </h3>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900">Verified & Immutable</h4>
                    <p className="text-sm text-green-700">This session is cryptographically secured</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-green-200">
                    <span className="text-sm text-gray-600 flex items-center">
                      <Hash className="w-4 h-4 mr-2" />
                      Entry Hash
                    </span>
                    <code className="text-xs bg-white px-2 py-1 rounded font-mono text-gray-700">
                      {session.entryHash?.substring(0, 24)}...
                    </code>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-green-200">
                    <span className="text-sm text-gray-600 flex items-center">
                      <Hash className="w-4 h-4 mr-2" />
                      Content Hash
                    </span>
                    <code className="text-xs bg-white px-2 py-1 rounded font-mono text-gray-700">
                      {session.contentHash?.substring(0, 24)}...
                    </code>
                  </div>

                  {session.prevHash && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600 flex items-center">
                        <Link2 className="w-4 h-4 mr-2" />
                        Previous Hash
                      </span>
                      <code className="text-xs bg-white px-2 py-1 rounded font-mono text-gray-700">
                        {session.prevHash.substring(0, 24)}...
                      </code>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-green-200">
                  <p className="text-xs text-green-700">
                    <Lock className="w-3 h-3 inline mr-1" />
                    Logged on {new Date(session.serverTs || session.clientTs).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
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
