import React, { useEffect, useMemo, useState, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  Plus,
  LogOut,
  TrendingUp,
  Clock,
  Calendar,
  Share2,
  BarChart3,
  FileText,
  Eye,
  Github,
  ChevronRight,
  Paperclip,
  Activity,
  Sparkles,
  Target,
  Layers,
  Flame,
  Trash2,
} from 'lucide-react'
import {
  getSkills,
  getSessions,
  createSession,
  getScoreBreakdown,
  getActivityHeatmap,
  addSkill,
  deleteSkill,
  getGitHubStatus,
} from '../services/api'
import { formatDuration, formatDate, getScoreLabel, getPhaseColor } from '../utils/helpers'
import SessionLogger from '../components/dashboard/SessionLogger'

const Timeline = lazy(() => import('../components/dashboard/Timeline'))
const ActivityHeatmap = lazy(() => import('../components/dashboard/ActivityHeatmap'))
const ScoreBreakdown = lazy(() => import('../components/dashboard/ScoreBreakdown'))
const CapsuleExport = lazy(() => import('../components/dashboard/CapsuleExport'))
const AddSkillModal = lazy(() => import('../components/dashboard/AddSkillModal'))
const GitHubConnect = lazy(() => import('../components/dashboard/GitHubConnect'))
const SessionDetail = lazy(() => import('../components/dashboard/SessionDetail'))

const SubViewLoader = () => (
  <div className="rounded-3xl border border-white/10 bg-white/5 p-12 flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500/25 border-t-primary-500" />
  </div>
)

const Dashboard = ({ user, onLogout }) => {
  const [skills, setSkills] = useState([])
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSessionLogger, setShowSessionLogger] = useState(false)
  const [showAddSkill, setShowAddSkill] = useState(false)
  const [showGitHubConnect, setShowGitHubConnect] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)
  const [activeView, setActiveView] = useState('overview')
  const [heatmapData, setHeatmapData] = useState([])
  const [scoreData, setScoreData] = useState(null)
  const [githubConnected, setGithubConnected] = useState(false)
  const [githubLogin, setGithubLogin] = useState(null)
  const [availableRepos, setAvailableRepos] = useState([])

  useEffect(() => {
    loadInitialData()
    loadGitHubStatus()
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('github') === 'connected') {
      window.history.replaceState({}, '', '/dashboard')
      loadGitHubStatus()
    }
  }, [])

  useEffect(() => {
    if (!selectedSkill) return
    loadSessions(selectedSkill.id)
    if (activeView === 'score') {
      setScoreData(null)
      loadScoreBreakdown(selectedSkill.id)
    }
  }, [selectedSkill, activeView])

  useEffect(() => {
    if (activeView === 'heatmap') {
      loadHeatmap(selectedSkill?.id)
    }
  }, [activeView, selectedSkill])

  const loadInitialData = async () => {
    try {
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
      const data = await getSessions(skillId)
      setSessions(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load sessions:', error)
      setSessions([])
    }
  }

  const loadHeatmap = async (skillId) => {
    try {
      const data = await getActivityHeatmap(skillId)
      setHeatmapData(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load heatmap:', error)
      setHeatmapData([])
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
    setSelectedSkill(newSkill)
    setShowAddSkill(false)
  }

  const handleDeleteSkill = async (skill) => {
    const sessionCount = skill.totalSessions ?? skill.total_sessions ?? 0
    if (sessionCount > 0) return
    const confirmed = window.confirm(`Delete "${skill.name}"? This cannot be undone.`)
    if (!confirmed) return

    await deleteSkill(skill.id)
    const updatedSkills = skills.filter((item) => item.id !== skill.id)
    setSkills(updatedSkills)
    if (selectedSkill?.id === skill.id) {
      setSelectedSkill(updatedSkills.length > 0 ? updatedSkills[0] : null)
    }
  }

  const loadGitHubStatus = async () => {
    try {
      const status = await getGitHubStatus()
      setGithubConnected(status.connected)
      setGithubLogin(status.connection?.github_login || null)
      setAvailableRepos(status.selectedRepos || [])
    } catch {
    }
  }

  const handleGitHubConnect = (selectedRepos) => {
    if (selectedRepos === null) {
      setGithubConnected(false)
      setGithubLogin(null)
      setAvailableRepos([])
      return
    }
    setAvailableRepos(selectedRepos)
  }

  const handleCreateSession = async (sessionData) => {
    try {
      await createSession(sessionData)
      await loadSessions(sessionData.skillId)

      const updatedSkills = skills.map((skill) => {
        if (skill.id !== sessionData.skillId) return skill
        return {
          ...skill,
          totalSessions: (skill.totalSessions || 0) + 1,
          totalHours: Math.round(((skill.totalHours || 0) + sessionData.durationSeconds / 3600) * 10) / 10,
        }
      })

      setSkills(updatedSkills)
      setShowSessionLogger(false)
    } catch (error) {
      console.error('Failed to create session:', error)
      throw error
    }
  }

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => new Date(b.clientTs) - new Date(a.clientTs)),
    [sessions]
  )

  const metrics = useMemo(() => {
    if (!selectedSkill) {
      return {
        totalSessions: 0,
        totalHours: 0,
        consistency: 0,
        score: 0,
      }
    }

    return {
      totalSessions: selectedSkill.totalSessions ?? selectedSkill.total_sessions ?? 0,
      totalHours: selectedSkill.totalHours ?? selectedSkill.total_hours ?? 0,
      consistency: selectedSkill.consistencyScore ?? 0,
      score: selectedSkill.score ?? 0,
    }
  }, [selectedSkill])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090812]">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-500/25 border-t-primary-500" />
          <div className="absolute inset-0 rounded-full blur-md bg-primary-500/20" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#090812] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-12 w-[420px] h-[420px] rounded-full bg-primary-600/10 blur-3xl" />
        <div className="absolute top-1/2 -right-20 w-[380px] h-[380px] rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[280px] bg-gradient-to-r from-transparent via-primary-500/6 to-transparent blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-white/[0.07] to-white/[0.03] p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Skill Ledger Dashboard</h1>
                <p className="text-sm text-gray-300 mt-1">
                  {user?.display_name || user?.displayName || user?.email?.split('@')[0] || 'User'} • {skills.length} tracked skill{skills.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowSessionLogger(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-violet-500 text-white font-semibold hover:opacity-95 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                Log Session
              </button>
              <button
                onClick={() => setShowAddSkill(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary-400/30 text-primary-200 hover:bg-primary-500/10 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Add Skill
              </button>
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 text-gray-300 hover:text-red-300 hover:border-red-400/30 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <aside className="xl:col-span-4 space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white">Skills</h2>
                <span className="text-xs px-2 py-1 rounded-lg bg-white/10 text-gray-300">{skills.length}</span>
              </div>

              {skills.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/20 bg-white/[0.03] p-6 text-center">
                  <p className="text-sm text-gray-400 mb-3">No skills added yet</p>
                  <button onClick={() => setShowAddSkill(true)} className="btn-primary text-sm">
                    <Plus className="w-4 h-4" />
                    Add your first skill
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[430px] overflow-y-auto pr-1">
                  {skills.map((skill) => {
                    const isSelected = selectedSkill?.id === skill.id
                    const canDelete = (skill.totalSessions ?? skill.total_sessions ?? 0) === 0
                    const score = skill.score ?? 0
                    return (
                      <button
                        key={skill.id}
                        onClick={() => setSelectedSkill(skill)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                          isSelected
                            ? 'border-primary-400/40 bg-primary-500/10'
                            : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-white truncate">{skill.name}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              {(skill.totalSessions ?? skill.total_sessions ?? 0)} sessions • {skill.totalHours ?? skill.total_hours ?? 0}h
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-white/10 text-white">{score}</span>
                            {canDelete && (
                              <span
                                onClick={(event) => {
                                  event.stopPropagation()
                                  handleDeleteSkill(skill)
                                }}
                                className="p-1 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-300"
                                role="button"
                                tabIndex={0}
                              >
                                <Trash2 className="w-4 h-4" />
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-[0.14em]">Quick Actions</h3>
              <button onClick={() => setShowSessionLogger(true)} className="w-full btn-primary text-sm py-2.5">
                <Plus className="w-4 h-4" />
                Log Session
              </button>
              <button
                onClick={() => {
                  if (selectedSkill) setActiveView('capsule')
                }}
                disabled={!selectedSkill}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share Capsule
              </button>
              <button
                onClick={() => setShowGitHubConnect(true)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-primary-400/25 bg-primary-500/10 px-4 py-2.5 text-sm text-primary-200 hover:bg-primary-500/20 transition-colors"
              >
                <Github className="w-4 h-4" />
                {githubConnected ? 'Manage GitHub' : 'Connect GitHub'}
              </button>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-[0.14em]">GitHub Status</h3>
                <Github className="w-4 h-4 text-gray-400" />
              </div>
              {githubConnected ? (
                <>
                  <p className="text-sm text-emerald-300 font-medium">Connected {githubLogin ? `as @${githubLogin}` : ''}</p>
                  <p className="text-xs text-gray-400 mt-1">{availableRepos.length} selected repositories for proof links</p>
                </>
              ) : (
                <p className="text-sm text-gray-400">No GitHub account linked yet.</p>
              )}
            </section>
          </aside>

          <main className="xl:col-span-8 space-y-6">
            {!selectedSkill && skills.length === 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 sm:p-14 text-center">
                <div className="w-16 h-16 rounded-2xl mx-auto bg-primary-500/15 border border-primary-500/25 flex items-center justify-center mb-5">
                  <TrendingUp className="w-8 h-8 text-primary-300" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Start your first learning track</h2>
                <p className="text-gray-400 max-w-xl mx-auto mb-6">Create a skill and begin logging focused sessions. Your consistency, score, and activity timeline update automatically.</p>
                <button onClick={() => setShowAddSkill(true)} className="btn-primary">
                  <Plus className="w-4 h-4" />
                  Add your first skill
                </button>
              </div>
            )}

            {selectedSkill && (
              <>
                <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-primary-500/12 via-transparent to-violet-500/10 p-5 sm:p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-bold text-white leading-tight">{selectedSkill.name}</h2>
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs sm:text-sm text-gray-300">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10">
                          <Calendar className="w-3.5 h-3.5" />
                          Started {formatDate(selectedSkill.createdAt || selectedSkill.created_at)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10">
                          <FileText className="w-3.5 h-3.5" />
                          {metrics.totalSessions} sessions
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10">
                          <Clock className="w-3.5 h-3.5" />
                          {metrics.totalHours}h logged
                        </span>
                        {(selectedSkill.linked_repo_name || selectedSkill.linkedRepoName) && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 text-primary-200">
                            <Github className="w-3.5 h-3.5" />
                            {selectedSkill.linked_repo_name || selectedSkill.linkedRepoName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {(() => {
                        const { label, color, bg } = getScoreLabel(metrics.score)
                        return (
                          <div className={`${bg} ${color} rounded-2xl px-4 py-3 border border-white/10`}>
                            <div className="text-3xl font-bold leading-none">{metrics.score}</div>
                            <div className="text-xs mt-1 font-semibold uppercase tracking-wide">{label}</div>
                          </div>
                        )
                      })()}
                    </div>
                  </div>

                  <div className="mt-5 pt-5 border-t border-white/10">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'overview', label: 'Overview', icon: Eye },
                        { id: 'timeline', label: 'Timeline', icon: Layers },
                        { id: 'heatmap', label: 'Heatmap', icon: Activity },
                        { id: 'score', label: 'Score', icon: BarChart3 },
                        { id: 'capsule', label: 'Capsule', icon: Share2 },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveView(tab.id)}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                            activeView === tab.id
                              ? 'border-primary-400/40 bg-primary-500/20 text-white'
                              : 'border-white/10 text-gray-300 hover:text-white hover:border-white/20 hover:bg-white/5'
                          }`}
                        >
                          <tab.icon className="w-4 h-4" />
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                {activeView === 'overview' && (
                  <div className="space-y-6">
                    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                      {[
                        {
                          label: 'Consistency',
                          value: `${metrics.consistency}%`,
                          hint: 'Last 30 days',
                          icon: Target,
                          color: 'text-emerald-300',
                        },
                        {
                          label: 'Sessions',
                          value: String(metrics.totalSessions),
                          hint: 'All time',
                          icon: FileText,
                          color: 'text-sky-300',
                        },
                        {
                          label: 'Hours',
                          value: `${metrics.totalHours}h`,
                          hint: 'Cumulative',
                          icon: Clock,
                          color: 'text-violet-300',
                        },
                        {
                          label: 'Current streak',
                          value: String(heatmapData.flat().reverse().findIndex((d) => d.count === 0) === -1 ? heatmapData.flat().length : heatmapData.flat().reverse().findIndex((d) => d.count === 0)),
                          hint: 'From recent days',
                          icon: Flame,
                          color: 'text-orange-300',
                        },
                      ].map((item) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs uppercase tracking-[0.12em] text-gray-400">{item.label}</span>
                            <item.icon className={`w-4 h-4 ${item.color}`} />
                          </div>
                          <div className="text-2xl font-bold text-white">{item.value}</div>
                          <div className="text-xs text-gray-500 mt-1">{item.hint}</div>
                        </motion.div>
                      ))}
                    </section>

                    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-xl font-semibold text-white">Recent Sessions</h3>
                        {sortedSessions.length > 0 && (
                          <button
                            onClick={() => setActiveView('timeline')}
                            className="inline-flex items-center gap-1 text-sm text-primary-300 hover:text-primary-200"
                          >
                            View timeline
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {sortedSessions.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] py-12 text-center">
                          <FileText className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                          <p className="text-gray-400 mb-4">No sessions logged for this skill yet</p>
                          <button onClick={() => setShowSessionLogger(true)} className="btn-primary text-sm">
                            <Plus className="w-4 h-4" />
                            Log first session
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {sortedSessions.slice(0, 6).map((session) => (
                            <button
                              key={session.id}
                              onClick={() => setSelectedSession(session)}
                              className="w-full text-left rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 p-4 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${getPhaseColor(session.phase)}`} />
                                    <h4 className="font-semibold text-white truncate">{session.topic}</h4>
                                  </div>
                                  {session.notes && (
                                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                                      {session.notes.length > 120 ? `${session.notes.slice(0, 120)}...` : session.notes}
                                    </p>
                                  )}
                                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                                    <span className="inline-flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5" />
                                      {formatDuration(session.durationSeconds)}
                                    </span>
                                    <span>{formatDate(session.clientTs)}</span>
                                    {session.proofOfWork?.length > 0 && (
                                      <span className="inline-flex items-center gap-1 text-primary-300">
                                        <Paperclip className="w-3.5 h-3.5" />
                                        {session.proofOfWork.length} proof files
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0 mt-1" />
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </section>
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
          </main>
        </div>
      </div>

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

      {showGitHubConnect && (
        <Suspense fallback={null}>
          <GitHubConnect
            onClose={() => {
              setShowGitHubConnect(false)
              loadGitHubStatus()
            }}
            onConnect={handleGitHubConnect}
            githubConnected={githubConnected}
            githubLogin={githubLogin}
            initialSelected={availableRepos}
            skills={skills}
          />
        </Suspense>
      )}

      {selectedSession && (
        <Suspense fallback={null}>
          <SessionDetail session={selectedSession} onClose={() => setSelectedSession(null)} />
        </Suspense>
      )}
    </div>
  )
}

export default Dashboard
