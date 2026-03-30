import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Github, CheckCircle, Loader, ExternalLink,
  AlertCircle, RefreshCw, Lock, Search, Save
} from 'lucide-react'
import { getGitHubAuthUrl, getGitHubRepos, disconnectGitHub, saveSelectedRepos } from '../../services/api'

/**
 * GitHubConnect modal
 * Props:
 *   onClose         — close modal
 *   onConnect(sel)  — called after saving selection (sel = selected repo objects) or null on disconnect
 *   githubConnected — bool
 *   githubLogin     — string | null
 *   initialSelected — array of already-selected repo objects (from DB)
 *   skills          — array of user skills (to detect linked repos)
 */
const GitHubConnect = ({
  onClose,
  onConnect,
  githubConnected = false,
  githubLogin = null,
  initialSelected = [],
  skills = [],
}) => {
  const [step, setStep] = useState(githubConnected ? 'manage' : 'connect')
  const [loading, setLoading] = useState(false)
  const [reposLoading, setReposLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [allRepos, setAllRepos] = useState([])
  const [selectedIds, setSelectedIds] = useState(() => new Set(initialSelected.map(r => r.full_name)))
  const [error, setError] = useState('')
  const [blockedError, setBlockedError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Repos linked to skills — cannot be deselected.
  // linked_repo_id may be stored as "owner/repo" full_name OR a numeric GitHub repo id.
  const isRepoLinked = useMemo(() => {
    const linkedIds = skills
      .filter(s => s.linked_repo_id)
      .map(s => String(s.linked_repo_id))
    const linkedNames = skills
      .filter(s => s.linked_repo_name)
      .map(s => s.linked_repo_name)
    return (repo) =>
      linkedIds.includes(repo.full_name) ||      // stored as full_name
      linkedIds.includes(String(repo.id)) ||     // stored as numeric id
      linkedNames.includes(repo.name)            // fallback by name
  }, [skills])

  const getLinkedSkillForRepo = (repo) =>
    skills.find(s =>
      s.linked_repo_id === repo.full_name ||
      String(s.linked_repo_id) === String(repo.id) ||
      s.linked_repo_name === repo.name
    )

  useEffect(() => {
    if (githubConnected && step === 'manage' && allRepos.length === 0) {
      fetchAllRepos()
    }
  }, [githubConnected, step])

  useEffect(() => {
    setSelectedIds(new Set(initialSelected.map(r => r.full_name)))
  }, [initialSelected])

  const fetchAllRepos = async () => {
    setReposLoading(true)
    setError('')
    try {
      const repos = await getGitHubRepos()
      setAllRepos(repos)
    } catch {
      setError('Failed to load repositories. Please try again.')
    } finally {
      setReposLoading(false)
    }
  }

  const handleGitHubAuth = () => {
    window.location.href = getGitHubAuthUrl()
  }

  const toggleRepo = (repo) => {
    setBlockedError('')
    const isSelected = selectedIds.has(repo.full_name)
    if (isSelected) {
      if (isRepoLinked(repo)) {
        const linkedSkill = getLinkedSkillForRepo(repo)
        setBlockedError(
          `"${repo.name}" is linked to skill "${linkedSkill?.name || 'a skill'}". Unlink it from the skill first to remove.`
        )
        return
      }
      setSelectedIds(prev => { const n = new Set(prev); n.delete(repo.full_name); return n })
    } else {
      setSelectedIds(prev => new Set([...prev, repo.full_name]))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const selected = allRepos.filter(r => selectedIds.has(r.full_name))
      await saveSelectedRepos(selected)
      onConnect(selected)
    } catch (err) {
      setError(err.message || 'Failed to save selection. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDisconnect = async () => {
    const hasLinked = skills.some(s => s.linked_repo_id || s.linked_repo_name)
    if (hasLinked) {
      setError('You have repositories linked to skills. Unlink them from your skills before disconnecting GitHub.')
      return
    }
    setLoading(true)
    try {
      await disconnectGitHub()
      onConnect(null)
      onClose()
    } catch {
      setError('Failed to disconnect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getLanguageColor = (lang) => ({
    JavaScript: 'bg-yellow-400', TypeScript: 'bg-blue-600',
    Python: 'bg-blue-500', Java: 'bg-red-500',
    Dart: 'bg-cyan-500', Go: 'bg-cyan-400',
    Rust: 'bg-orange-500', 'C++': 'bg-pink-500',
    'C#': 'bg-purple-500', Ruby: 'bg-red-400',
    PHP: 'bg-indigo-400', Swift: 'bg-orange-400',
  })[lang] || 'bg-gray-400'

  const filteredRepos = allRepos.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedCount = selectedIds.size
  const hasChanges = JSON.stringify([...selectedIds].sort()) !==
    JSON.stringify(initialSelected.map(r => r.full_name).sort())

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="glass-card glass-glow rounded-2xl p-6 max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-3">
              <Github className="w-7 h-7 text-white" />
              <h2 className="text-xl font-bold text-white">GitHub Integration</h2>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error banner */}
          <AnimatePresence>
            {(error || blockedError) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start space-x-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{blockedError || error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Connect step ────────────────────────────────── */}
          {step === 'connect' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-5">
                <Github className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Connect Your GitHub</h3>
              <p className="text-gray-400 text-sm mb-6">
                Link GitHub to browse repositories and attach code files as proof of work.
                After connecting you choose which repositories to make available.
              </p>
              <button onClick={handleGitHubAuth} disabled={loading} className="btn-primary w-full flex items-center justify-center space-x-2">
                {loading
                  ? <><Loader className="w-5 h-5 animate-spin" /><span>Redirecting…</span></>
                  : <><Github className="w-5 h-5" /><span>Authorize with GitHub</span></>}
              </button>
              <p className="text-xs text-gray-500 mt-4">Read-only access to repositories. Disconnect any time.</p>
            </div>
          )}

          {/* ── Manage step ─────────────────────────────────── */}
          {step === 'manage' && (
            <div className="flex flex-col flex-1 min-h-0">
              {/* Connected badge */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mb-4 flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-400 text-sm">GitHub Connected</p>
                  {githubLogin && <p className="text-xs text-emerald-400/70">@{githubLogin}</p>}
                </div>
              </div>

              {/* Title row */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium text-gray-300 text-sm">Select Repositories</p>
                  <p className="text-xs text-gray-500">{selectedCount} selected · available in skills &amp; sessions</p>
                </div>
                <button onClick={fetchAllRepos} disabled={reposLoading} className="text-gray-500 hover:text-white transition-colors" title="Refresh repos">
                  <RefreshCw className={`w-4 h-4 ${reposLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Search */}
              {allRepos.length > 5 && (
                <div className="relative mb-3">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search repositories…"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white placeholder-gray-500"
                  />
                </div>
              )}

              {/* Repo list */}
              <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0 mb-4 pr-0.5">
                {reposLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader className="w-5 h-5 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-500 text-sm">Loading repositories…</span>
                  </div>
                ) : filteredRepos.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 text-sm">
                    {searchQuery ? 'No matching repositories.' : 'No repositories found.'}
                  </div>
                ) : filteredRepos.map(repo => {
                  const isSelected = selectedIds.has(repo.full_name)
                  const isLinked = isRepoLinked(repo)
                  return (
                    <div
                      key={repo.id}
                      onClick={() => toggleRepo(repo)}
                      className={`flex items-center space-x-3 p-3 rounded-xl border cursor-pointer transition-all select-none
                        ${isSelected ? 'border-primary-500/50 bg-primary-500/10' : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'}`}
                    >
                      {/* Checkbox */}
                      <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors
                        ${isSelected ? 'bg-primary-600 border-primary-600' : 'border-white/20 bg-white/5'}`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-1.5">
                          <span className="font-medium text-white text-sm truncate">{repo.name}</span>
                          {repo.private && <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">private</span>}
                          {isLinked && (
                            <span className="flex items-center gap-0.5 text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                              <Lock className="w-3 h-3" /><span>linked</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {repo.language && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <span className={`w-2 h-2 rounded-full ${getLanguageColor(repo.language)}`} />
                              {repo.language}
                            </span>
                          )}
                          {repo.description && <span className="text-xs text-gray-400 truncate">{repo.description}</span>}
                        </div>
                      </div>

                      {/* External link */}
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="text-gray-500 hover:text-white flex-shrink-0 p-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )
                })}
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <button
                  onClick={handleSave}
                  disabled={saving || reposLoading || !hasChanges}
                  className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving
                    ? <><Loader className="w-4 h-4 animate-spin" /><span>Saving…</span></>
                    : <><Save className="w-4 h-4" /><span>Save Selection ({selectedCount} repos)</span></>}
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="w-full text-sm text-red-500 hover:text-red-700 py-1.5 transition-colors flex items-center justify-center gap-1"
                >
                  {loading && <Loader className="w-3.5 h-3.5 animate-spin" />}
                  <span>Disconnect GitHub Account</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default GitHubConnect
