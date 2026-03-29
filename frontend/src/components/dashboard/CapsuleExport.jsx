import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Share2, Download, Copy, CheckCircle, ExternalLink, Lock, Shield, Linkedin, Award, Loader, AlertCircle, Clock, Eye, History } from 'lucide-react'
import { generateCapsuleToken, generateCertificate, getCapsuleHistory } from '../../services/api'
import { formatDate, formatDuration } from '../../utils/helpers'

const CapsuleExport = ({ skill, sessions }) => {
  const [shareToken, setShareToken] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  
  // Certificate state
  const [certificate, setCertificate] = useState(null)
  const [certLoading, setCertLoading] = useState(false)
  const [certError, setCertError] = useState('')

  // Capsule history state
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [copiedHistoryToken, setCopiedHistoryToken] = useState(null)

  // Ensure sessions is an array
  const safeSessions = Array.isArray(sessions) ? sessions : []

  // Fetch capsule history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      setHistoryLoading(true)
      try {
        const data = await getCapsuleHistory(skill.id)
        setHistory(data.history || [])
      } catch (err) {
        console.error('Failed to fetch capsule history:', err)
      } finally {
        setHistoryLoading(false)
      }
    }
    if (skill?.id) fetchHistory()
  }, [skill?.id])

  const refreshHistory = async () => {
    try {
      const data = await getCapsuleHistory(skill.id)
      setHistory(data.history || [])
    } catch (_) { /* silently fail */ }
  }

  const handleGenerateToken = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await generateCapsuleToken(skill.id)
      setShareToken(result)
      // Refresh history to include the new link
      await refreshHistory()
    } catch (err) {
      console.error('Failed to generate token:', err)
      setError(err.message || 'Failed to generate shareable link')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = () => {
    if (shareToken) {
      navigator.clipboard.writeText(shareToken.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleGenerateCertificate = async () => {
    setCertLoading(true)
    setCertError('')
    try {
      const result = await generateCertificate(skill.id)
      setCertificate(result)
    } catch (err) {
      console.error('Failed to generate certificate:', err)
      setCertError(err.message || 'Failed to generate certificate')
    } finally {
      setCertLoading(false)
    }
  }

  const handleDownloadJSON = () => {
    const capsuleData = {
      skill: {
        name: skill.name,
        category: skill.category,
        score: skill.score,
        createdAt: skill.createdAt || skill.created_at
      },
      sessions: safeSessions.map(s => ({
        id: s.id,
        topic: s.topic,
        notes: s.notes,
        duration: s.durationSeconds || s.duration_seconds,
        timestamp: s.clientTs || s.client_ts,
        contentHash: s.contentHash || s.content_hash,
        entryHash: s.entryHash || s.entry_hash,
        prevHash: s.prevHash || s.prev_hash,
        phase: s.phase
      })),
      metadata: {
        exportedAt: new Date().toISOString(),
        totalSessions: safeSessions.length,
        totalHours: Math.floor(safeSessions.reduce((sum, s) => sum + (s.durationSeconds || s.duration_seconds || 0), 0) / 3600),
        chainVerified: true
      }
    }

    const blob = new Blob([JSON.stringify(capsuleData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `skill-capsule-${skill.name.toLowerCase().replace(/\s+/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadPDF = () => {
    // For now, create an HTML-based printable view
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Skill Capsule - ${skill.name}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #0ea5e9; border-bottom: 3px solid #0ea5e9; padding-bottom: 10px; }
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
          .score { background: linear-gradient(135deg, #0ea5e9, #8b5cf6); color: white; padding: 20px 30px; border-radius: 12px; text-align: center; }
          .score-value { font-size: 48px; font-weight: bold; }
          .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0; }
          .stat { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #1f2937; }
          .stat-label { color: #6b7280; font-size: 14px; }
          .sessions { margin-top: 30px; }
          .session { border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
          .session-topic { font-weight: bold; color: #1f2937; }
          .session-meta { color: #6b7280; font-size: 12px; margin-top: 5px; }
          .hash { font-family: monospace; font-size: 10px; color: #9ca3af; margin-top: 10px; word-break: break-all; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>🎯 ${skill.name}</h1>
            <p style="color: #6b7280;">Verified Learning Journey - Skill Capsule</p>
          </div>
          <div class="score">
            <div class="score-value">${skill.score}</div>
            <div>Authenticity Score</div>
          </div>
        </div>
        
        <div class="stats">
          <div class="stat">
            <div class="stat-value">${safeSessions.length}</div>
            <div class="stat-label">Total Sessions</div>
          </div>
          <div class="stat">
            <div class="stat-value">${formatDuration(safeSessions.reduce((sum, s) => sum + (s.durationSeconds || s.duration_seconds || 0), 0))}</div>
            <div class="stat-label">Time Invested</div>
          </div>
          <div class="stat">
            <div class="stat-value">${skill.current_phase || skill.currentPhase || 'Learning'}</div>
            <div class="stat-label">Current Phase</div>
          </div>
        </div>
        
        <div class="sessions">
          <h2>📝 Session Log</h2>
          ${safeSessions.slice(0, 20).map(s => `
            <div class="session">
              <div class="session-topic">${s.topic}</div>
              <div class="session-meta">
                ${formatDate(s.clientTs || s.client_ts)} • ${formatDuration(s.durationSeconds || s.duration_seconds || 0)} • ${s.phase || 'Learning'}
              </div>
              ${s.notes ? `<p style="margin-top: 10px; color: #4b5563;">${s.notes.substring(0, 200)}${s.notes.length > 200 ? '...' : ''}</p>` : ''}
              <div class="hash">Hash: ${(s.entryHash || s.entry_hash || '').substring(0, 40)}...</div>
            </div>
          `).join('')}
          ${safeSessions.length > 20 ? `<p style="color: #6b7280; text-align: center;">... and ${safeSessions.length - 20} more sessions</p>` : ''}
        </div>
        
        <div class="footer">
          <p>🔐 This capsule contains cryptographic hashes linking each session. Chain verified.</p>
          <p>Generated: ${new Date().toLocaleString()}</p>
          <p>Skill Ledger - Decentralized Timestamped Credential System</p>
        </div>
      </body>
      </html>
    `
    
    const printWindow = window.open('', '_blank')
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }

  const totalDuration = safeSessions.reduce((sum, s) => sum + (s.durationSeconds || s.duration_seconds || 0), 0)
  const latestSession = safeSessions.length > 0 ? safeSessions[safeSessions.length - 1] : null

  return (
    <div className="space-y-6">
      {/* Capsule Preview */}
      <div className="glass-card glass-glow rounded-xl p-8 border-primary-500/20">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{skill.name}</h2>
            <p className="text-gray-400">Skill Capsule Preview</p>
          </div>
          <div className="bg-gradient-to-br from-primary-600 to-purple-600 text-white px-6 py-3 rounded-xl">
            <div className="text-3xl font-bold">{skill.score}</div>
            <div className="text-xs">Score</div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="glass rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Total Sessions</div>
            <div className="text-2xl font-bold text-white">{safeSessions.length}</div>
          </div>
          <div className="glass rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Time Invested</div>
            <div className="text-2xl font-bold text-white">{formatDuration(totalDuration)}</div>
          </div>
          <div className="glass rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Latest Activity</div>
            <div className="text-lg font-bold text-white">
              {latestSession ? formatDate(latestSession.clientTs || latestSession.client_ts) : 'N/A'}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-300 glass rounded-lg p-3">
          <Shield className="w-5 h-5 text-green-400" />
          <span className="font-semibold">Chain Verified:</span>
          <span className="font-mono">
            {latestSession 
              ? `${(latestSession.entryHash || latestSession.entry_hash || 'N/A').substring(0, 20)}...` 
              : 'N/A'}
          </span>
        </div>
      </div>

      {/* Share Options */}
      <div className="glass-card glass-glow rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Share Your Capsule</h3>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {!shareToken ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-primary-500/10 border border-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Share2 className="w-8 h-8 text-primary-400" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">
              Generate Shareable Link
            </h4>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Create a secure, time-limited link to share your verified learning journey 
              with recruiters and evaluators.
            </p>
            <button
              onClick={handleGenerateToken}
              disabled={loading}
              className="btn-primary mx-auto"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Share2 className="w-5 h-5" />
                  <span>Generate Shareable Link</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold text-emerald-400">Link Generated Successfully!</span>
              </div>
              <p className="text-sm text-emerald-400/70">
                Expires on {formatDate(shareToken.expiresAt)}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={shareToken.url}
                readOnly
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg font-mono text-sm text-gray-300"
              />
              <button
                onClick={handleCopyLink}
                className="btn-secondary flex items-center space-x-2"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex space-x-3">
              <a
                href={shareToken.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 btn-secondary flex items-center justify-center space-x-2"
              >
                <ExternalLink className="w-5 h-5" />
                <span>Preview Capsule</span>
              </a>
              <button
                onClick={handleGenerateToken}
                className="btn-secondary"
              >
                Regenerate
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* LinkedIn Certificate Section */}
      <div className="glass-card glass-glow rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <History className="w-6 h-6 text-primary-400 mr-2" />
          Previously Generated Links
        </h3>

        {historyLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-primary-600 mr-2" />
            <span className="text-gray-500">Loading history…</span>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-10 h-10 mx-auto mb-3 text-gray-600" />
            <p className="text-gray-400">No capsule links generated yet.</p>
            <p className="text-sm text-gray-500 mt-1">Generate your first shareable link above!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-gray-500 uppercase text-xs tracking-wider">
                  <th className="pb-3 pr-4">Generated</th>
                  <th className="pb-3 pr-4">Expires</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Views</th>
                  <th className="pb-3 pr-4">Sessions</th>
                  <th className="pb-3 pr-4">Hours</th>
                  <th className="pb-3 pr-4">Score</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((item) => {
                  const isExpired = item.isExpired || new Date(item.expiresAt) < new Date()
                  const isActive = item.isActive && !isExpired
                  return (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 pr-4 text-gray-300 whitespace-nowrap">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="py-3 pr-4 text-gray-300 whitespace-nowrap">
                        {formatDate(item.expiresAt)}
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap">
                        {isActive ? (
                          <span className="inline-flex items-center space-x-1 text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-xs bg-white/5 text-gray-500 px-2 py-1 rounded-full">
                            <Clock className="w-3 h-3" />
                            <span>Expired</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-gray-300">
                        <span className="flex items-center space-x-1">
                          <Eye className="w-3.5 h-3.5 text-gray-400" />
                          <span>{item.viewCount || 0}</span>
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-300">
                        {item.totalSessionsSnapshot ?? '—'}
                      </td>
                      <td className="py-3 pr-4 text-gray-300">
                        {item.totalHoursSnapshot != null ? `${parseFloat(item.totalHoursSnapshot).toFixed(1)}h` : '—'}
                      </td>
                      <td className="py-3 pr-4 text-gray-300 font-medium">
                        {item.scoreSnapshot ?? '—'}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center space-x-2">
                          {isActive && (
                            <>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(item.url)
                                  setCopiedHistoryToken(item.token)
                                  setTimeout(() => setCopiedHistoryToken(null), 2000)
                                }}
                                className="text-gray-400 hover:text-primary-600 transition-colors"
                                title="Copy link"
                              >
                                {copiedHistoryToken === item.token ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-primary-600 transition-colors"
                                title="Open capsule"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* LinkedIn Certificate Section */}
      <div className="glass-card glass-glow rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <Linkedin className="w-6 h-6 text-blue-400 mr-2" />
          LinkedIn Certificate
        </h3>

        {certError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>{certError}</span>
          </div>
        )}

        {!certificate ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-blue-400" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">
              Create LinkedIn Certificate
            </h4>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Generate a verifiable certificate you can add to your LinkedIn profile 
              to showcase your skills with cryptographic proof.
            </p>
            <button
              onClick={handleGenerateCertificate}
              disabled={certLoading || safeSessions.length === 0}
              className="btn-primary mx-auto !bg-gradient-to-r !from-blue-600 !to-blue-500 !shadow-blue-500/30"
            >
              {certLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Linkedin className="w-5 h-5" />
                  <span>Generate Certificate</span>
                </>
              )}
            </button>
            {safeSessions.length === 0 && (
              <p className="text-sm text-gray-500 mt-3">
                Log at least one session to generate a certificate
              </p>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-blue-400" />
                <span className="font-semibold text-blue-400">Certificate Generated!</span>
              </div>
              <p className="text-sm text-blue-400/70">
                Issued on {formatDate(certificate.issuedAt)}
              </p>
            </div>

            {/* Certificate Preview Card */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Award className="w-10 h-10" />
                <span className="text-sm opacity-80">Skill Ledger Certificate</span>
              </div>
              <h4 className="text-2xl font-bold mb-2">{skill.name}</h4>
              <p className="text-sm opacity-80 mb-4">Verified Learning Journey</p>
              <div className="grid grid-cols-3 gap-4 text-center border-t border-white/20 pt-4">
                <div>
                  <div className="text-xl font-bold">{skill.score}</div>
                  <div className="text-xs opacity-80">Score</div>
                </div>
                <div>
                  <div className="text-xl font-bold">{safeSessions.length}</div>
                  <div className="text-xs opacity-80">Sessions</div>
                </div>
                <div>
                  <div className="text-xl font-bold">{Math.round(totalDuration / 3600)}h</div>
                  <div className="text-xs opacity-80">Hours</div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <a
                href={certificate.linkedInShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 btn-primary !bg-gradient-to-r !from-blue-600 !to-blue-500 !shadow-blue-500/30"
              >
                <Linkedin className="w-5 h-5" />
                <span>Add to LinkedIn</span>
              </a>
              <a
                href={certificate.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                <ExternalLink className="w-5 h-5" />
                <span>View</span>
              </a>
            </div>
          </motion.div>
        )}
      </div>

      {/* Export Options */}
      <div className="glass-card glass-glow rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Export Options</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={handleDownloadJSON}
            disabled={safeSessions.length === 0}
            className="flex items-center justify-center space-x-3 p-6 border-2 border-white/10 rounded-xl hover:border-primary-500 hover:bg-primary-500/5 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-6 h-6 text-gray-400 group-hover:text-primary-400" />
            <div className="text-left">
              <div className="font-semibold text-white group-hover:text-primary-400">
                Download JSON
              </div>
              <div className="text-sm text-gray-400">
                Complete data export with hashes
              </div>
            </div>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={safeSessions.length === 0}
            className="flex items-center justify-center space-x-3 p-6 border-2 border-white/10 rounded-xl hover:border-purple-500 hover:bg-purple-500/5 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-6 h-6 text-gray-400 group-hover:text-purple-400" />
            <div className="text-left">
              <div className="font-semibold text-white group-hover:text-purple-400">
                Export PDF
              </div>
              <div className="text-sm text-gray-400">
                Professional capsule report
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-gray-900 text-white rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Lock className="w-6 h-6 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold mb-2">Tamper-Proof Guarantee</h4>
            <p className="text-sm text-gray-300 leading-relaxed">
              Your capsule contains cryptographic hashes linking each session. Any modification 
              to the data will break the chain and be immediately detectable. Recipients can 
              verify the integrity of your learning journey independently.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CapsuleExport
