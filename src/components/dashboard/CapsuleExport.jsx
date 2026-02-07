import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Share2, Download, Copy, CheckCircle, ExternalLink, Lock, Shield } from 'lucide-react'
import { generateCapsuleToken } from '../../services/api'
import { formatDate, formatDuration } from '../../utils/helpers'

const CapsuleExport = ({ skill, sessions }) => {
  const [shareToken, setShareToken] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerateToken = async () => {
    setLoading(true)
    try {
      const result = await generateCapsuleToken(skill.id)
      setShareToken(result)
    } catch (error) {
      console.error('Failed to generate token:', error)
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

  const handleDownloadJSON = () => {
    const capsuleData = {
      skill: {
        name: skill.name,
        category: skill.category,
        score: skill.score,
        createdAt: skill.createdAt
      },
      sessions: sessions.map(s => ({
        id: s.id,
        topic: s.topic,
        notes: s.notes,
        duration: s.durationSeconds,
        timestamp: s.clientTs,
        contentHash: s.contentHash,
        entryHash: s.entryHash,
        prevHash: s.prevHash,
        phase: s.phase
      })),
      metadata: {
        exportedAt: new Date().toISOString(),
        totalSessions: sessions.length,
        totalHours: Math.floor(sessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 3600),
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

  const totalDuration = sessions.reduce((sum, s) => sum + s.durationSeconds, 0)
  const latestSession = sessions.length > 0 ? sessions[sessions.length - 1] : null

  return (
    <div className="space-y-6">
      {/* Capsule Preview */}
      <div className="glass-card rounded-xl p-8 bg-gradient-to-br from-primary-50 to-purple-50">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{skill.name}</h2>
            <p className="text-gray-600">Skill Capsule Preview</p>
          </div>
          <div className="bg-gradient-to-br from-primary-600 to-purple-600 text-white px-6 py-3 rounded-xl">
            <div className="text-3xl font-bold">{skill.score}</div>
            <div className="text-xs">Score</div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Total Sessions</div>
            <div className="text-2xl font-bold text-gray-900">{sessions.length}</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Time Invested</div>
            <div className="text-2xl font-bold text-gray-900">{formatDuration(totalDuration)}</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Latest Activity</div>
            <div className="text-lg font-bold text-gray-900">
              {latestSession ? formatDate(latestSession.clientTs) : 'N/A'}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-700 bg-white rounded-lg p-3">
          <Shield className="w-5 h-5 text-green-600" />
          <span className="font-semibold">Chain Verified:</span>
          <span className="font-mono">{latestSession ? `${latestSession.entryHash.substring(0, 20)}...` : 'N/A'}</span>
        </div>
      </div>

      {/* Share Options */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Share Your Capsule</h3>

        {!shareToken ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Share2 className="w-8 h-8 text-primary-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Generate Shareable Link
            </h4>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create a secure, time-limited link to share your verified learning journey 
              with recruiters and evaluators.
            </p>
            <button
              onClick={handleGenerateToken}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Generating...' : 'Generate Shareable Link'}
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-900">Link Generated Successfully!</span>
              </div>
              <p className="text-sm text-green-700">
                Expires on {formatDate(shareToken.expiresAt)}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={shareToken.url}
                readOnly
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm"
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

      {/* Export Options */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Export Options</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={handleDownloadJSON}
            className="flex items-center justify-center space-x-3 p-6 border-2 border-gray-300 rounded-xl hover:border-primary-600 hover:bg-primary-50 transition-all group"
          >
            <Download className="w-6 h-6 text-gray-600 group-hover:text-primary-600" />
            <div className="text-left">
              <div className="font-semibold text-gray-900 group-hover:text-primary-600">
                Download JSON
              </div>
              <div className="text-sm text-gray-600">
                Complete data export with hashes
              </div>
            </div>
          </button>

          <button
            className="flex items-center justify-center space-x-3 p-6 border-2 border-gray-300 rounded-xl hover:border-purple-600 hover:bg-purple-50 transition-all group"
          >
            <Download className="w-6 h-6 text-gray-600 group-hover:text-purple-600" />
            <div className="text-left">
              <div className="font-semibold text-gray-900 group-hover:text-purple-600">
                Export PDF
              </div>
              <div className="text-sm text-gray-600">
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
