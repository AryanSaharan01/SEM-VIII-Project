import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Shield, CheckCircle, XCircle, Clock, BookOpen, Award, ExternalLink,
  Loader, AlertCircle, ChevronDown, ChevronUp, Eye, Hash, User, Calendar
} from 'lucide-react'
import { getCapsuleByToken } from '../services/api'
import { formatDate, formatDuration } from '../utils/helpers'

const phaseColors = {
  Exposure: { bg: 'bg-blue-500/10', text: 'text-blue-400', bar: 'bg-blue-500' },
  Confusion: { bg: 'bg-amber-500/10', text: 'text-amber-400', bar: 'bg-amber-500' },
  Learning: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', bar: 'bg-emerald-500' },
  Integration: { bg: 'bg-purple-500/10', text: 'text-purple-400', bar: 'bg-purple-500' },
  Proficiency: { bg: 'bg-rose-500/10', text: 'text-rose-400', bar: 'bg-rose-500' },
}

export default function CapsuleView() {
  const { token } = useParams()
  const [capsule, setCapsule] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedSession, setExpandedSession] = useState(null)

  useEffect(() => {
    const fetchCapsule = async () => {
      try {
        const data = await getCapsuleByToken(token)
        setCapsule(data)
      } catch (err) {
        setError(err.message || 'This capsule link is invalid or has expired.')
      } finally {
        setLoading(false)
      }
    }
    fetchCapsule()
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Loading capsule…</p>
        </div>
      </div>
    )
  }

  if (error || !capsule) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800 border border-red-500/30 rounded-2xl p-10 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Capsule Not Found</h1>
          <p className="text-gray-400 mb-8">{error || 'This capsule link is invalid or has expired.'}</p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl transition-colors"
          >
            <span>Go to Skill Ledger</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    )
  }

  const { skill, owner, sessions = [], phaseDistribution = [], chainVerification, metadata } = capsule
  const totalDuration = sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors">
            <BookOpen className="w-5 h-5" />
            <span className="font-bold text-lg">Skill Ledger</span>
          </Link>
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <Eye className="w-4 h-4" />
            <span>{metadata?.viewCount || 0} views</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-cyan-600 via-blue-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-[1]">
            <div className="flex items-center space-x-3 mb-2 text-white/70 text-sm">
              <User className="w-4 h-4" />
              <span>{owner?.displayName || owner?.username || 'Anonymous'}</span>
              {skill?.category && (
                <>
                  <span>•</span>
                  <span>{skill.category}</span>
                </>
              )}
            </div>
            <h1 className="text-4xl font-extrabold mb-6">{skill?.name || 'Untitled Skill'}</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatBox label="Score" value={skill?.score ?? 0} />
              <StatBox label="Sessions" value={skill?.totalSessions ?? sessions.length} />
              <StatBox label="Hours" value={`${(parseFloat(skill?.totalHours) || totalDuration / 3600).toFixed(1)}h`} />
              <StatBox label="Phase" value={skill?.currentPhase || 'Learning'} small />
            </div>
          </div>
        </motion.div>

        {/* Chain Verification */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-xl p-5 border flex items-center space-x-4 ${
            chainVerification?.valid
              ? 'bg-emerald-900/30 border-emerald-500/30'
              : 'bg-red-900/30 border-red-500/30'
          }`}
        >
          {chainVerification?.valid ? (
            <CheckCircle className="w-7 h-7 text-emerald-400 flex-shrink-0" />
          ) : (
            <XCircle className="w-7 h-7 text-red-400 flex-shrink-0" />
          )}
          <div>
            <h3 className={`font-semibold ${chainVerification?.valid ? 'text-emerald-300' : 'text-red-300'}`}>
              {chainVerification?.valid ? 'Chain Integrity Verified ✓' : 'Chain Verification Failed'}
            </h3>
            <p className="text-gray-400 text-sm">
              {chainVerification?.valid
                ? `All ${chainVerification.length || sessions.length} session hashes form a valid, unbroken chain.`
                : chainVerification?.error || 'One or more session hashes could not be verified.'}
            </p>
          </div>
        </motion.div>

        {/* Phase Distribution */}
        {phaseDistribution.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 border border-gray-700/50 rounded-xl p-6"
          >
            <h2 className="text-lg font-bold text-white mb-4">Phase Distribution</h2>
            <div className="space-y-3">
              {phaseDistribution.map(p => {
                const colors = phaseColors[p.phase] || phaseColors.Learning
                return (
                  <div key={p.phase} className="flex items-center space-x-3">
                    <span className="text-sm text-gray-300 w-28 flex-shrink-0">{p.phase}</span>
                    <div className="flex-1 bg-gray-700 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${p.percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className={`h-full rounded-full ${colors.bar}`}
                      />
                    </div>
                    <span className="text-sm text-gray-400 w-16 text-right">
                      {p.count} ({p.percentage}%)
                    </span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Session Log */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 border border-gray-700/50 rounded-xl p-6"
        >
          <h2 className="text-lg font-bold text-white mb-4">
            Session Log ({sessions.length} sessions)
          </h2>
          <div className="space-y-3">
            {sessions.map((s, i) => {
              const isExpanded = expandedSession === s.id
              const pColors = phaseColors[s.phase] || phaseColors.Learning
              return (
                <div
                  key={s.id}
                  className="bg-gray-900/60 border border-gray-700/40 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedSession(isExpanded ? null : s.id)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-700/30 transition-colors"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <span className="text-gray-500 text-xs font-mono w-6 flex-shrink-0">
                        #{i + 1}
                      </span>
                      <span className="text-white font-medium truncate">{s.topic}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${pColors.bg} ${pColors.text} flex-shrink-0`}>
                        {s.phase}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 flex-shrink-0 ml-3">
                      <span className="text-gray-400 text-sm hidden sm:inline">
                        {formatDuration(s.duration_seconds || 0)}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="px-4 pb-4 border-t border-gray-700/30"
                    >
                      <div className="pt-3 space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(s.client_ts)}</span>
                          <span>•</span>
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(s.duration_seconds || 0)}</span>
                          {s.difficulty && (
                            <>
                              <span>•</span>
                              <span>Difficulty: {s.difficulty}/5</span>
                            </>
                          )}
                        </div>
                        {s.notes && (
                          <p className="text-gray-300 text-sm mt-2 leading-relaxed">{s.notes}</p>
                        )}
                        {s.xp_earned > 0 && (
                          <div className="text-xs text-cyan-400">+{s.xp_earned} XP</div>
                        )}
                        {/* Proof of Work */}
                        {s.proof_of_work && s.proof_of_work.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Proof of Work</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {s.proof_of_work.map((p, pi) => (
                                <span
                                  key={pi}
                                  className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                                >
                                  {p.type === 'github_commit' ? '🔗' : '📁'} {p.name || p.path || p.type}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* Hash */}
                        <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                          <Hash className="w-3 h-3" />
                          <span className="font-mono truncate">
                            {(s.entry_hash || '').substring(0, 48)}…
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Metadata Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/50 border border-gray-700/30 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-400 gap-3"
        >
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Tamper-proof capsule powered by <strong className="text-cyan-300">Skill Ledger</strong></span>
          </div>
          <div className="flex items-center space-x-4">
            {metadata?.expiresAt && (
              <span>Expires: {formatDate(metadata.expiresAt)}</span>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  )
}

function StatBox({ label, value, small }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
      <div className={`font-bold ${small ? 'text-lg' : 'text-2xl'}`}>{value}</div>
      <div className="text-xs text-white/70 mt-1">{label}</div>
    </div>
  )
}
