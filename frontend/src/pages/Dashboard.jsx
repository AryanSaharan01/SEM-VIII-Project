import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, Plus, LogOut, TrendingUp, Clock, 
  Calendar, Share2, BarChart3, FileText, Eye, Github, ChevronRight, Paperclip, Lock
} from 'lucide-react'
import { getSkills, getSessions, createSession, getScoreBreakdown, getActivityHeatmap, addSkill, deleteSkill, getGitHubStatus, disconnectGitHub } from '../services/api'
import { formatDuration, formatDate, getScoreLabel, getPhaseColor } from '../utils/helpers'
import { useDebouncedCallback } from '../utils/hooks'

// Import subcomponents
import SkillCard from '../components/dashboard/SkillCard'
import SessionLogger from '../components/dashboard/SessionLogger'

// Lazy load heavy dashboard sub-views
const Timeline = lazy(() => import('../components/dashboard/Timeline'))
const ActivityHeatmap = lazy(() => import('../components/dashboard/ActivityHeatmap'))
const ScoreBreakdown = lazy(() => import('../components/dashboard/ScoreBreakdown'))
const CapsuleExport = lazy(() => import('../components/dashboard/CapsuleExport'))
const AddSkillModal = lazy(() => import('../components/dashboard/AddSkillModal'))
const GitHubConnect = lazy(() => import('../components/dashboard/GitHubConnect'))
const SessionDetail = lazy(() => import('../components/dashboard/SessionDetail'))

const SubViewLoader = () => (
  <div className="glass-card glass-glow rounded-2xl p-12 flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500/20 border-t-primary-500" />
  </div>
)

const DEMO_EMAILS = ['demo@skillledger.com', 'test@skillledger.com']

const Dashboard = ({ user, onLogout }) => {
  const isDemo = DEMO_EMAILS.includes(user?.email)

  // Load from sessionStorage ONLY for demo users
  const [skills, setSkills] = useState(() => {
    if (!isDemo) return []
    const saved = sessionStorage.getItem('skillLedgerSkills')
    return saved ? JSON.parse(saved) : []
  })
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [sessions, setSessions] = useState(() => {
    if (!isDemo) return []
    const saved = sessionStorage.getItem('skillLedgerSessions')
    return saved ? JSON.parse(saved) : []
  })
  const [loading, setLoading] = useState(true)
  const [showSessionLogger, setShowSessionLogger] = useState(false)
  const [showAddSkill, setShowAddSkill] = useState(false)
  const [showGitHubConnect, setShowGitHubConnect] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)
  const [activeView, setActiveView] = useState('overview')
  const [heatmapData, setHeatmapData] = useState([])
  const [scoreData, setScoreData] = useState(null)
  
  // GitHub state
  const [githubConnected, setGithubConnected] = useState(false)
  const [githubLogin, setGithubLogin] = useState(null)
  const [availableRepos, setAvailableRepos] = useState([])

  // Save to sessionStorage whenever skills or sessions change
  useEffect(() => {
    if (skills.length > 0) {
      sessionStorage.setItem('skillLedgerSkills', JSON.stringify(skills))
    }
  }, [skills])

  useEffect(() => {
    if (sessions.length > 0) {
      sessionStorage.setItem('skillLedgerSessions', JSON.stringify(sessions))
    }
  }, [sessions])

  useEffect(() => {
    loadInitialData()
    loadGitHubStatus()
  }, [])

  // Check for ?github=connected after OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('github') === 'connected') {
      window.history.replaceState({}, '', '/dashboard')
      loadGitHubStatus()
    }
  }, [])

  useEffect(() => {
    if (selectedSkill) {
      loadSessions(selectedSkill.id)
      if (activeView === 'score') {
        setScoreData(null) // Reset to show loading state
        loadScoreBreakdown(selectedSkill.id)
      }
    }
  }, [selectedSkill, activeView])

  useEffect(() => {
    if (activeView === 'heatmap') {
      loadHeatmap(selectedSkill?.id)
    }
  }, [activeView, selectedSkill])

  const loadInitialData = async () => {
    try {
      if (isDemo) {
        // Demo users: try sessionStorage cache first
        const savedSkills = sessionStorage.getItem('skillLedgerSkills')
        const savedSessions = sessionStorage.getItem('skillLedgerSessions')
        if (savedSkills && savedSessions) {
          const parsedSkills = JSON.parse(savedSkills)
          const parsedSessions = JSON.parse(savedSessions)
          setSkills(parsedSkills)
          setSessions(parsedSessions)
          if (parsedSkills.length > 0) setSelectedSkill(parsedSkills[0])
          return
        }
      }
      // Real users (and demo fallback): always fetch from API
      const data = await getSkills()
      const safeSkills = Array.isArray(data) ? data : []
      setSkills(safeSkills)
      if (safeSkills.length > 0) setSelectedSkill(safeSkills[0])
    } catch (error) {
      console.error('Failed to load initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSessions = async (skillId) => {
    try {
      if (isDemo) {
        const savedSessions = sessionStorage.getItem('skillLedgerSessions')
        if (savedSessions) {
          const allSessions = JSON.parse(savedSessions)
          setSessions(allSessions.filter(s => s.skillId === skillId))
          return
        }
      }
      const data = await getSessions(skillId)
      setSessions(data)
    } catch (error) {
      console.error('Failed to load sessions:', error)
    }
  }

  const loadHeatmap = async (skillId) => {
    try {
      const data = await getActivityHeatmap(skillId)
      setHeatmapData(data)
    } catch (error) {
      console.error('Failed to load heatmap:', error)
    }
  }

  const loadScoreBreakdown = async (skillId) => {
    try {
      const data = await getScoreBreakdown(skillId)
      setScoreData(data)
    } catch (error) {
      console.error('Failed to load score breakdown:', error)
    }
  }

  const handleAddSkill = async (skillData) => {
    const newSkill = await addSkill(skillData)
    if (!newSkill) return
    const updatedSkills = [...skills, newSkill]
    setSkills(updatedSkills)
    if (isDemo) sessionStorage.setItem('skillLedgerSkills', JSON.stringify(updatedSkills))
    setSelectedSkill(newSkill)
    setShowAddSkill(false)
  }

  const handleDeleteSkill = async (skillId) => {
    await deleteSkill(skillId) // throws on error — SkillCard handles it
    const updatedSkills = skills.filter(s => s.id !== skillId)
    setSkills(updatedSkills)
    if (isDemo) sessionStorage.setItem('skillLedgerSkills', JSON.stringify(updatedSkills))
    if (selectedSkill?.id === skillId) {
      setSelectedSkill(updatedSkills.length > 0 ? updatedSkills[0] : null)
    }
  }

  const loadGitHubStatus = async () => {
    try {
      const status = await getGitHubStatus()
      setGithubConnected(status.connected)
      setGithubLogin(status.connection?.github_login || null)
      // Use only the repos the user has explicitly selected
      setAvailableRepos(status.selectedRepos || [])
    } catch {
      // silently fail — GitHub is optional
    }
  }

  const handleGitHubConnect = (selectedRepos) => {
    // selectedRepos = null means disconnect happened inside the modal
    if (selectedRepos === null) {
      setGithubConnected(false)
      setGithubLogin(null)
      setAvailableRepos([])
    } else {
      // User saved a new selection — update available repos
      setAvailableRepos(selectedRepos)
    }
  }

  const handleCreateSession = async (sessionData) => {
    try {
      const newSession = await createSession(sessionData)

      if (isDemo) {
        // Demo: persist in sessionStorage
        const allSavedSessions = JSON.parse(sessionStorage.getItem('skillLedgerSessions') || '[]')
        sessionStorage.setItem('skillLedgerSessions', JSON.stringify([...allSavedSessions, newSession]))
      }

      // Refresh sessions from source
      await loadSessions(sessionData.skillId)

      // Update skill stats in sidebar
      const updatedSkills = skills.map(skill => {
        if (skill.id === sessionData.skillId) {
          return {
            ...skill,
            totalSessions: (skill.totalSessions || 0) + 1,
            totalHours: Math.round(((skill.totalHours || 0) + sessionData.durationSeconds / 3600) * 10) / 10
          }
        }
        return skill
      })
      setSkills(updatedSkills)
      if (isDemo) sessionStorage.setItem('skillLedgerSkills', JSON.stringify(updatedSkills))

      setShowSessionLogger(false)
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0c0a13]">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-500/20 border-t-primary-500"></div>
          <div className="absolute inset-0 rounded-full blur-md bg-primary-500/20"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0c0a13] animated-gradient-bg">
      {/* Top Navigation */}
      <nav className="frosted-nav sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -inset-1 bg-primary-500/15 rounded-xl blur-md -z-10" />
              </div>
              <span className="text-2xl font-bold text-shimmer">Skill Ledger</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right mr-4">
                <div className="text-sm font-semibold text-white">{user?.display_name || user?.displayName || user?.email?.split('@')[0] || 'User'}</div>
                <div className="text-xs text-gray-500">{user?.email ? user.email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + '\u2022'.repeat(Math.min(b.length, 5)) + c) : ''}</div>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-red-400 glass rounded-xl hover:border-red-500/20 hover:bg-red-500/5 transition-all duration-300"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Skills List */}
            <div className="glass-card glass-glow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">My Skills</h2>
                <button 
                  onClick={() => setShowAddSkill(true)}
                  className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-white rounded-lg flex items-center justify-center transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50"
                  title="Add New Skill"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {skills.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm mb-4">No skills yet</p>
                  <button
                    onClick={() => setShowAddSkill(true)}
                    className="btn-primary text-sm"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Add Your First Skill
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {skills.map(skill => (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      isSelected={selectedSkill?.id === skill.id}
                      onClick={() => setSelectedSkill(skill)}
                      onDelete={handleDeleteSkill}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="glass-card glass-glow p-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowSessionLogger(true)}
                  className="w-full btn-primary text-sm py-2"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Log Session
                </button>
                <button
                  onClick={() => { if (selectedSkill) setActiveView('capsule') }}
                  disabled={!selectedSkill}
                  className="w-full btn-secondary text-sm py-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Share2 className="w-4 h-4 inline mr-2" />
                  Share Capsule
                </button>
              </div>
            </div>

            {/* GitHub Integration */}
            <div className="glass-card glass-glow p-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">GitHub Integration</h3>
              {githubConnected ? (
                <div className="space-y-3">
                  <div className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/15 p-3 rounded-xl shadow-lg shadow-emerald-500/5">
                    <div className="flex items-center space-x-2 mb-1">
                      <Github className="w-4 h-4" />
                      <span className="font-medium">Connected</span>
                    </div>
                    {githubLogin && (
                      <div className="text-xs text-emerald-400">@{githubLogin}</div>
                    )}
                    <div className="text-xs text-emerald-400/70 mt-1">
                      {availableRepos.length} repositories available
                    </div>
                  </div>
                  <button
                    onClick={() => setShowGitHubConnect(true)}
                    className="w-full text-sm py-2 text-gray-500 hover:text-white transition-colors"
                  >
                    Manage / Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowGitHubConnect(true)}
                  className="w-full flex items-center justify-center space-x-2 bg-white/5 border border-white/10 text-white py-2.5 rounded-xl hover:bg-white/10 transition-all text-sm"
                >
                  <Github className="w-4 h-4" />
                  <span>Connect GitHub</span>
                </button>
              )}
              <p className="text-xs text-gray-600 mt-3">
                Link repos to attach code as proof of work
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">

            {/* Empty state for brand-new real users */}
            {!selectedSkill && skills.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card glass-glow p-12 text-center"
              >
                <div className="w-20 h-20 bg-primary-500/10 border border-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-10 h-10 text-primary-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">
                  Welcome, {user?.display_name || user?.displayName || user?.email?.split('@')[0]}! 🎉
                </h2>
                <p className="text-gray-400 text-lg mb-2">Your skill ledger is empty — and that's a great starting point.</p>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Add your first skill to begin tracking your learning journey with verified, timestamped proof of your progress.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setShowAddSkill(true)}
                    className="btn-primary flex items-center justify-center space-x-2 px-8 py-3 text-base"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Your First Skill</span>
                  </button>
                </div>
                <div className="mt-10 grid grid-cols-3 gap-6 max-w-lg mx-auto text-center">
                  {[
                    { emoji: '🎯', label: 'Pick a skill', desc: 'Coding, writing, design, music…' },
                    { emoji: '📝', label: 'Log sessions', desc: 'Record what you learn each day' },
                    { emoji: '📈', label: 'Track progress', desc: 'Watch your score grow over time' },
                  ].map(step => (
                    <div key={step.label} className="p-4 glass rounded-xl">
                      <div className="text-3xl mb-2">{step.emoji}</div>
                      <div className="font-semibold text-white text-sm">{step.label}</div>
                      <div className="text-gray-500 text-xs mt-1">{step.desc}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {selectedSkill && (
              <>
                {/* Skill Header */}
                <div className="glass-card glass-glow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-2">
                        {selectedSkill.name}
                      </h1>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Started {formatDate(selectedSkill.createdAt || selectedSkill.created_at)}
                        </span>
                        <span className="flex items-center">
                          <FileText className="w-4 h-4 mr-1" />
                          {selectedSkill.totalSessions || selectedSkill.total_sessions || 0} sessions
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {selectedSkill.totalHours || selectedSkill.total_hours || 0}h logged
                        </span>
                        {/* Show linked repo — resolve html_url from availableRepos */}
                        {(selectedSkill.linked_repo_name || selectedSkill.linkedRepoName) && (() => {
                          const storedId = selectedSkill.linked_repo_id || selectedSkill.linkedRepoId || ''
                          const repoName = selectedSkill.linked_repo_name || selectedSkill.linkedRepoName
                          // Look up the full repo object from availableRepos (has html_url)
                          const repoObj = availableRepos.find(r =>
                            r.full_name === storedId ||
                            String(r.id) === String(storedId) ||
                            r.name === repoName
                          )
                          const href = repoObj?.html_url ||
                            (storedId.includes('/') ? `https://github.com/${storedId}` : null)
                          if (!href) return (
                            <span className="flex items-center text-primary-600">
                              <Github className="w-4 h-4 mr-1" />
                              {repoName}
                            </span>
                          )
                          return (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                            >
                              <Github className="w-4 h-4 mr-1" />
                              {repoName}
                            </a>
                          )
                        })()}
                      </div>
                    </div>

                    <div className="text-right">
                      {(() => {
                        const { label, color, bg } = getScoreLabel(selectedSkill.score)
                        return (
                          <div className={`${bg} ${color} px-4 py-2 rounded-lg`}>
                            <div className="text-3xl font-bold">{selectedSkill.score}</div>
                            <div className="text-xs font-semibold">{label}</div>
                          </div>
                        )
                      })()}
                    </div>
                  </div>

                  {/* View Tabs */}
                  <div className="flex space-x-2 border-t border-white/5 pt-4 overflow-x-auto">
                    {[
                      { id: 'overview', label: 'Overview', icon: Eye },
                      { id: 'timeline', label: 'Timeline', icon: TrendingUp },
                      { id: 'heatmap', label: 'Heatmap', icon: Calendar },
                      { id: 'score', label: 'Score', icon: BarChart3 },
                      { id: 'capsule', label: 'Capsule', icon: Share2 }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveView(tab.id)}
                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${
                          activeView === tab.id
                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Content based on activeView */}
                {activeView === 'overview' && (
                  <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="stat-card p-6"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">Consistency</span>
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">
                          {selectedSkill.consistencyScore}%
                        </div>
                        <div className="text-xs text-gray-500">Last 30 days</div>
                        <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${selectedSkill.consistencyScore}%` }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                          />
                        </div>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="stat-card p-6"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">Total Sessions</span>
                          <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-sky-400" />
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">
                          {selectedSkill.totalSessions}
                        </div>
                        <div className="text-xs text-gray-500">All time</div>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="stat-card p-6"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">Time Invested</span>
                          <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-violet-400" />
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">
                          {selectedSkill.totalHours}h
                        </div>
                        <div className="text-xs text-gray-500">Cumulative</div>
                      </motion.div>
                    </div>

                    {/* Recent Sessions */}
                    <div className="glass-card glass-glow p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">Recent Sessions</h3>
                        {sessions.length > 0 && (
                          <button
                            onClick={() => setActiveView('timeline')}
                            className="flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                          >
                            View All
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </button>
                        )}
                      </div>
                      {sessions.length === 0 ? (
                        <div className="text-center py-12">
                          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                          <p className="text-gray-400 mb-4">No sessions logged yet</p>
                          <button
                            onClick={() => setShowSessionLogger(true)}
                            className="btn-primary text-sm"
                          >
                            <Plus className="w-4 h-4 inline mr-2" />
                            Log Your First Session
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {sessions
                            .sort((a, b) => new Date(b.clientTs) - new Date(a.clientTs))
                            .slice(0, 5)
                            .map(session => (
                            <motion.button
                              key={session.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              onClick={() => setSelectedSession(session)}
                              className="w-full text-left glass rounded-xl p-4 hover:bg-white/[0.06] hover:border-primary-500/20 transition-all duration-300 group"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <div className={`w-2 h-2 rounded-full ${getPhaseColor(session.phase)}`} />
                                    <h4 className="font-semibold text-white truncate">{session.topic}</h4>
                                    {session.difficulty && (
                                      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                                        session.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                        session.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                        session.difficulty === 'hard' ? 'bg-orange-100 text-orange-700' :
                                        'bg-red-100 text-red-700'
                                      }`}>
                                        {session.difficulty}
                                      </span>
                                    )}
                                  </div>
                                  {session.notes && (
                                    <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                                      {session.notes.length > 100 ? `${session.notes.substring(0, 100)}...` : session.notes}
                                    </p>
                                  )}
                                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                                    <span className="flex items-center">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {formatDuration(session.durationSeconds)}
                                    </span>
                                    <span>{formatDate(session.clientTs)}</span>
                                    {session.proofOfWork && session.proofOfWork.length > 0 && (
                                      <span className="flex items-center text-primary-400">
                                        <Paperclip className="w-3 h-3 mr-1" />
                                        {session.proofOfWork.length} files
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-primary-400 flex-shrink-0 transition-colors" />
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeView === 'timeline' && (
                  <Suspense fallback={<SubViewLoader />}>
                    <Timeline sessions={sessions} />
                  </Suspense>
                )}

                {activeView === 'heatmap' && (
                  <Suspense fallback={<SubViewLoader />}>
                    <ActivityHeatmap data={heatmapData} />
                  </Suspense>
                )}

                {activeView === 'score' && (
                  <Suspense fallback={<SubViewLoader />}>
                    <ScoreBreakdown skill={selectedSkill} data={scoreData} sessions={sessions} />
                  </Suspense>
                )}

                {activeView === 'capsule' && (
                  <Suspense fallback={<SubViewLoader />}>
                    <CapsuleExport skill={selectedSkill} sessions={sessions} />
                  </Suspense>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Session Logger Modal */}
      {showSessionLogger && (
        <SessionLogger
          onClose={() => setShowSessionLogger(false)}
          onSubmit={handleCreateSession}
          skills={skills}
          selectedSkillId={selectedSkill?.id}
          githubConnected={githubConnected}
          availableRepos={availableRepos}
        />
      )}

      {/* Add Skill Modal */}
      {showAddSkill && (
        <Suspense fallback={null}>
          <AddSkillModal
            isOpen={showAddSkill}
            onClose={() => setShowAddSkill(false)}
            onAdd={handleAddSkill}
            connectedRepos={availableRepos}
          />
        </Suspense>
      )}

      {/* GitHub Connect Modal */}
      {showGitHubConnect && (
        <Suspense fallback={null}>
          <GitHubConnect
            onClose={() => { setShowGitHubConnect(false); loadGitHubStatus() }}
            onConnect={handleGitHubConnect}
            githubConnected={githubConnected}
            githubLogin={githubLogin}
            initialSelected={availableRepos}
            skills={skills}
          />
        </Suspense>
      )}

      {/* Session Detail Modal */}
      {selectedSession && (
        <Suspense fallback={null}>
          <SessionDetail
            session={selectedSession}
            onClose={() => setSelectedSession(null)}
          />
        </Suspense>
      )}
    </div>
  )
}

export default Dashboard


