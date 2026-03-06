import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, Plus, LogOut, TrendingUp, Clock, 
  Calendar, Share2, BarChart3, FileText, Eye, Github, ChevronRight, Paperclip, Zap, Code
} from 'lucide-react'
import { getSkills, getSessions, createSession, getScoreBreakdown, getActivityHeatmap, addSkill } from '../services/api'
import { formatDuration, formatDate, getScoreLabel, getPhaseColor } from '../utils/helpers'

// Import subcomponents
import SkillCard from '../components/dashboard/SkillCard'
import SessionLogger from '../components/dashboard/SessionLogger'
import Timeline from '../components/dashboard/Timeline'
import ActivityHeatmap from '../components/dashboard/ActivityHeatmap'
import ScoreBreakdown from '../components/dashboard/ScoreBreakdown'
import CapsuleExport from '../components/dashboard/CapsuleExport'
import AddSkillModal from '../components/dashboard/AddSkillModal'
import GitHubConnect from '../components/dashboard/GitHubConnect'
import SessionDetail from '../components/dashboard/SessionDetail'

const Dashboard = ({ user, onLogout }) => {
  // Load from sessionStorage or use default
  const [skills, setSkills] = useState(() => {
    const saved = sessionStorage.getItem('skillLedgerSkills')
    return saved ? JSON.parse(saved) : []
  })
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [sessions, setSessions] = useState(() => {
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
  
  // GitHub connected repos (multiple)
  const [connectedRepos, setConnectedRepos] = useState(() => {
    const saved = localStorage.getItem('skillLedgerGitHubRepos')
    return saved ? JSON.parse(saved) : []
  })

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
  }, [])

  useEffect(() => {
    if (selectedSkill) {
      loadSessions(selectedSkill.id)
      if (activeView === 'score') {
        loadScoreBreakdown(selectedSkill.id)
      }
    }
  }, [selectedSkill, activeView])

  useEffect(() => {
    if (activeView === 'heatmap') {
      loadHeatmap()
    }
  }, [activeView])

  const loadInitialData = async () => {
    try {
      // Try to load from sessionStorage first
      const savedSkills = sessionStorage.getItem('skillLedgerSkills')
      const savedSessions = sessionStorage.getItem('skillLedgerSessions')
      
      if (savedSkills && savedSessions) {
        const parsedSkills = JSON.parse(savedSkills)
        const parsedSessions = JSON.parse(savedSessions)
        setSkills(parsedSkills)
        setSessions(parsedSessions)
        if (parsedSkills.length > 0) {
          setSelectedSkill(parsedSkills[0])
        }
      } else {
        // Load from API if nothing in sessionStorage
        const data = await getSkills()
        setSkills(data)
        if (data.length > 0) {
          setSelectedSkill(data[0])
        }
      }
    } catch (error) {
      console.error('Failed to load initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSessions = async (skillId) => {
    try {
      // Filter sessions from state or load from API
      const savedSessions = sessionStorage.getItem('skillLedgerSessions')
      if (savedSessions) {
        const allSessions = JSON.parse(savedSessions)
        setSessions(allSessions.filter(s => s.skillId === skillId))
      } else {
        const data = await getSessions(skillId)
        setSessions(data)
      }
    } catch (error) {
      console.error('Failed to load sessions:', error)
    }
  }

  const loadHeatmap = async () => {
    try {
      const data = await getActivityHeatmap()
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
    const updatedSkills = [...skills, newSkill]
    setSkills(updatedSkills)
    sessionStorage.setItem('skillLedgerSkills', JSON.stringify(updatedSkills))
    setSelectedSkill(newSkill)
    setShowAddSkill(false)
  }

  const handleGitHubConnect = (repos) => {
    setConnectedRepos(repos)
    if (repos && repos.length > 0) {
      localStorage.setItem('skillLedgerGitHubRepos', JSON.stringify(repos))
    } else {
      localStorage.removeItem('skillLedgerGitHubRepos')
    }
  }

  const handleCreateSession = async (sessionData) => {
    try {
      const newSession = await createSession(sessionData)
      
      // Update sessions in state
      const allSavedSessions = JSON.parse(sessionStorage.getItem('skillLedgerSessions') || '[]')
      const updatedAllSessions = [...allSavedSessions, newSession]
      sessionStorage.setItem('skillLedgerSessions', JSON.stringify(updatedAllSessions))
      
      // Update current sessions view
      await loadSessions(sessionData.skillId)
      
      // Update skill stats
      const updatedSkills = skills.map(skill => {
        if (skill.id === sessionData.skillId) {
          return {
            ...skill,
            totalSessions: (skill.totalSessions || 0) + 1,
            totalHours: Math.round((skill.totalHours || 0) + (sessionData.durationSeconds / 3600))
          }
        }
        return skill
      })
      setSkills(updatedSkills)
      sessionStorage.setItem('skillLedgerSkills', JSON.stringify(updatedSkills))
      
      setShowSessionLogger(false)
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center shadow-md">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">Skill Ledger</span>
                <p className="text-xs text-gray-500">Decentralized Time Capsule System</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right mr-4 hidden md:block">
                <div className="text-sm font-semibold text-gray-900">{user?.displayName || 'User'}</div>
                <div className="text-xs text-gray-500">{user?.email || ''}</div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all border border-transparent hover:border-red-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Skills List */}
            <div className="bg-white rounded-lg p-5 shadow-md border border-gray-200">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">My Skills</h2>
                <motion.button 
                  onClick={() => setShowAddSkill(true)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center justify-center transition-colors shadow-md"
                  title="Add New Skill"
                >
                  <Plus className="w-5 h-5" />
                </motion.button>
              </div>

              {skills.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Plus className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm mb-4">No skills yet</p>
                  <button
                    onClick={() => setShowAddSkill(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                  >
                    Add Your First Skill
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {skills.map((skill, index) => (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      isSelected={selectedSkill?.id === skill.id}
                      onClick={() => setSelectedSkill(skill)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg p-5 shadow-md border border-gray-200">
              <h3 className="text-sm font-bold text-gray-700 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowSessionLogger(true)}
                  className="w-full bg-primary-600 text-white rounded-lg py-2.5 px-4 font-medium text-sm hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log Session</span>
                </button>
                <button className="w-full bg-white border-2 border-gray-200 text-gray-700 rounded-lg py-2.5 px-4 font-medium text-sm hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center space-x-2">
                  <Share2 className="w-4 h-4" />
                  <span>Share Capsule</span>
                </button>
              </div>
            </div>

            {/* GitHub Integration */}
            <div className="bg-gray-900 rounded-lg p-5 shadow-md text-white">
              <h3 className="text-sm font-bold mb-4 flex items-center">
                <Github className="w-4 h-4 mr-2" />
                GitHub Integration
              </h3>
              {connectedRepos.length > 0 ? (
                <div className="space-y-3">
                  <div className="bg-emerald-500/20 border border-emerald-500/50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Github className="w-4 h-4" />
                      <span className="font-semibold text-sm">{connectedRepos.length} repos connected</span>
                    </div>
                    <div className="text-xs space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
                      {connectedRepos.slice(0, 3).map(repo => (
                        <div key={repo.id} className="truncate">• {repo.name}</div>
                      ))}
                      {connectedRepos.length > 3 && (
                        <div>+{connectedRepos.length - 3} more</div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowGitHubConnect(true)}
                    className="w-full text-sm py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    Manage Repositories
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => setShowGitHubConnect(true)}
                    className="w-full flex items-center justify-center space-x-2 bg-white text-gray-900 py-2.5 rounded-lg hover:bg-gray-100 transition-colors text-sm font-semibold"
                  >
                    <Github className="w-4 h-4" />
                    <span>Connect GitHub</span>
                  </button>
                  <p className="text-xs text-gray-400 mt-3 text-center">
                    Link repos to attach code as proof of work
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-5">
            {selectedSkill && (
              <>
                {/* Skill Header */}
                <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${
                          selectedSkill.category === 'coding'
                            ? 'bg-primary-600'
                            : 'bg-emerald-600'
                        }`}>
                          {selectedSkill.category === 'coding' ? (
                            <Code className="w-7 h-7 text-white" />
                          ) : (
                            <FileText className="w-7 h-7 text-white" />
                          )}
                        </div>
                        <div>
                          <h1 className="text-3xl font-bold text-gray-900">
                            {selectedSkill.name}
                          </h1>
                          <p className="text-sm text-gray-600 font-medium capitalize mt-1">{selectedSkill.category} Skill</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 font-medium">
                        <span className="flex items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                          <Calendar className="w-4 h-4 mr-2 text-primary-600" />
                          Started {formatDate(selectedSkill.createdAt)}
                        </span>
                        <span className="flex items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                          <FileText className="w-4 h-4 mr-2 text-accent-600" />
                          {selectedSkill.totalSessions} sessions
                        </span>
                        <span className="flex items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                          <Clock className="w-4 h-4 mr-2 text-emerald-600" />
                          {selectedSkill.totalHours}h logged
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      {(() => {
                        const { label, color, bg } = getScoreLabel(selectedSkill.score)
                        return (
                          <div className={`${bg} ${color} px-6 py-4 rounded-lg border-2 border-current/20`}>
                            <div className="text-4xl font-bold mb-1">{selectedSkill.score}</div>
                            <div className="text-xs font-bold uppercase tracking-wider">{label}</div>
                          </div>
                        )
                      })()}
                    </div>
                  </div>

                  {/* View Tabs */}
                  <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-5">
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
                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-semibold transition-all ${
                          activeView === tab.id
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-100 bg-white border border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        <span className="text-sm">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Content based on activeView */}
                {activeView === 'overview' && (
                  <div className="space-y-5">
                    {/* Stats Grid */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-emerald-600 rounded-lg p-5 shadow-md text-white">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-emerald-100 text-sm font-semibold">Consistency</span>
                          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="text-3xl font-bold mb-1">
                          {selectedSkill.consistencyScore}%
                        </div>
                        <div className="text-xs text-emerald-100 font-medium">Last 30 days</div>
                      </div>

                      <div className="bg-primary-600 rounded-lg p-5 shadow-md text-white">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-primary-100 text-sm font-semibold">Total Sessions</span>
                          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="text-3xl font-bold mb-1">
                          {selectedSkill.totalSessions}
                        </div>
                        <div className="text-xs text-primary-100 font-medium">All time</div>
                      </div>

                      <div className="bg-accent-600 rounded-lg p-5 shadow-md text-white">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-accent-100 text-sm font-semibold">Total Hours</span>
                          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="text-3xl font-bold mb-1">
                          {selectedSkill.totalHours}
                        </div>
                        <div className="text-xs text-accent-100 font-medium">Logged</div>
                      </div>
                    </div>

                    {/* Recent Sessions */}
                    <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center">
                          <div className="w-1 h-6 bg-primary-600 rounded-full mr-3"></div>
                          Recent Sessions
                        </h3>
                        {sessions.length > 0 && (
                          <button
                            onClick={() => setActiveView('timeline')}
                            className="flex items-center text-sm text-primary-600 hover:text-primary-700 font-semibold transition-colors bg-primary-50 px-3 py-2 rounded-lg"
                          >
                            View All
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </button>
                        )}
                      </div>
                      {sessions.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <FileText className="w-8 h-8 text-primary-600" />
                          </div>
                          <p className="text-gray-500 mb-5 font-medium">No sessions logged yet</p>
                          <button
                            onClick={() => setShowSessionLogger(true)}
                            className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold flex items-center space-x-2 mx-auto"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Log Your First Session</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {sessions
                            .sort((a, b) => new Date(b.clientTs) - new Date(a.clientTs))
                            .slice(0, 5)
                            .map((session, index) => (
                            <button
                              key={session.id}
                              onClick={() => setSelectedSession(session)}
                              className="w-full text-left border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-primary-300 transition-all bg-gray-50 hover:bg-gray-100 group"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <div className={`w-3 h-3 rounded-full ${getPhaseColor(session.phase)}`} />
                                    <h4 className="font-semibold text-gray-900 truncate">{session.topic}</h4>
                                    {session.difficulty && (
                                      <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 font-medium ${
                                        session.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' :
                                        session.difficulty === 'medium' ? 'bg-orange-100 text-orange-700' :
                                        session.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                                        'bg-accent-100 text-accent-700'
                                      }`}>
                                        {session.difficulty}
                                      </span>
                                    )}
                                  </div>
                                  {session.notes && (
                                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                      {session.notes.length > 100 ? `${session.notes.substring(0, 100)}...` : session.notes}
                                    </p>
                                  )}
                                  <div className="flex items-center space-x-3 text-xs font-medium">
                                    <span className="flex items-center text-gray-600">
                                      <Clock className="w-3.5 h-3.5 mr-1.5 text-primary-600" />
                                      {formatDuration(session.durationSeconds)}
                                    </span>
                                    <span className="text-gray-500">{formatDate(session.clientTs)}</span>
                                    {session.proofOfWork && session.proofOfWork.length > 0 && (
                                      <span className="flex items-center text-primary-600">
                                        <Paperclip className="w-3.5 h-3.5 mr-1.5" />
                                        {session.proofOfWork.length} files
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 flex-shrink-0 transition-colors ml-4" />
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeView === 'timeline' && (
                  <Timeline sessions={sessions} />
                )}

                {activeView === 'heatmap' && (
                  <ActivityHeatmap data={heatmapData} />
                )}

                {activeView === 'score' && (
                  <ScoreBreakdown skill={selectedSkill} data={scoreData} sessions={sessions} />
                )}

                {activeView === 'capsule' && (
                  <CapsuleExport skill={selectedSkill} sessions={sessions} />
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
          connectedRepos={connectedRepos}
        />
      )}

      {/* Add Skill Modal */}
      {showAddSkill && (
        <AddSkillModal
          isOpen={showAddSkill}
          onClose={() => setShowAddSkill(false)}
          onAdd={handleAddSkill}
          connectedRepos={connectedRepos}
        />
      )}

      {/* GitHub Connect Modal */}
      {showGitHubConnect && (
        <GitHubConnect
          onClose={() => setShowGitHubConnect(false)}
          onConnect={handleGitHubConnect}
          connectedRepos={connectedRepos}
        />
      )}

      {/* Session Detail Modal */}
      {selectedSession && (
        <SessionDetail
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  )
}

export default Dashboard
