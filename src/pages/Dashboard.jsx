import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, Plus, LogOut, TrendingUp, Clock, 
  Calendar, Share2, BarChart3, FileText, Eye, Github, ChevronRight, Paperclip
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-primary-50/30">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">Skill Ledger</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right mr-4">
                <div className="text-sm font-semibold text-gray-900">{user?.displayName || 'User'}</div>
                <div className="text-xs text-gray-500">{user?.email || ''}</div>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">My Skills</h2>
                <button 
                  onClick={() => setShowAddSkill(true)}
                  className="w-8 h-8 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center justify-center transition-colors shadow-md hover:shadow-lg"
                  title="Add New Skill"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {skills.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm mb-4">No skills yet</p>
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
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowSessionLogger(true)}
                  className="w-full btn-primary text-sm py-2 shadow-md hover:shadow-lg"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Log Session
                </button>
                <button className="w-full btn-secondary text-sm py-2 shadow-sm hover:shadow-md">
                  <Share2 className="w-4 h-4 inline mr-2" />
                  Share Capsule
                </button>
              </div>
            </div>

            {/* GitHub Integration */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">GitHub Integration</h3>
              {connectedRepos.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Github className="w-4 h-4" />
                      <span className="font-medium">{connectedRepos.length} repos connected</span>
                    </div>
                    <div className="text-xs text-green-600 space-y-1">
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
                    className="w-full text-sm py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Manage Repositories
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowGitHubConnect(true)}
                  className="w-full flex items-center justify-center space-x-2 bg-gray-900 text-white py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-sm shadow-md hover:shadow-lg"
                >
                  <Github className="w-4 h-4" />
                  <span>Connect GitHub</span>
                </button>
              )}
              <p className="text-xs text-gray-500 mt-3">
                Link repos to attach code as proof of work
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {selectedSkill && (
              <>
                {/* Skill Header */}
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {selectedSkill.name}
                      </h1>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Started {formatDate(selectedSkill.createdAt)}
                        </span>
                        <span className="flex items-center">
                          <FileText className="w-4 h-4 mr-1" />
                          {selectedSkill.totalSessions} sessions
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {selectedSkill.totalHours}h logged
                        </span>
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
                  <div className="flex space-x-2 border-t pt-4">
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
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                          activeView === tab.id
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
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
                      <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:scale-105">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600 text-sm">Consistency</span>
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                          {selectedSkill.consistencyScore}%
                        </div>
                        <div className="text-xs text-gray-500">Last 30 days</div>
                      </div>

                      <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:scale-105">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600 text-sm">Total Sessions</span>
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                          {selectedSkill.totalSessions}
                        </div>
                        <div className="text-xs text-gray-500">All time</div>
                      </div>

                      <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:scale-105">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600 text-sm">Time Invested</span>
                          <Clock className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                          {selectedSkill.totalHours}h
                        </div>
                        <div className="text-xs text-gray-500">Cumulative</div>
                      </div>
                    </div>

                    {/* Recent Sessions */}
                    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">Recent Sessions</h3>
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
                          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 mb-4">No sessions logged yet</p>
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
                              className="w-full text-left border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-primary-300 transition-all bg-white shadow-sm group"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <div className={`w-2 h-2 rounded-full ${getPhaseColor(session.phase)}`} />
                                    <h4 className="font-semibold text-gray-900 truncate">{session.topic}</h4>
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
                                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
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
                                      <span className="flex items-center text-primary-600">
                                        <Paperclip className="w-3 h-3 mr-1" />
                                        {session.proofOfWork.length} files
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 flex-shrink-0 transition-colors" />
                              </div>
                            </motion.button>
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
