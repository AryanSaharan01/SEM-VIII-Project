import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Info, Zap, Clock, Target, Calendar, Repeat, Brain, Award } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area } from 'recharts'

const ScoreBreakdown = ({ skill, data, sessions }) => {
  if (!data) {
    return (
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  // Calculate insights
  const insights = useMemo(() => {
    if (!sessions || sessions.length === 0) return null

    const now = new Date()
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    const lastWeekSessions = sessions.filter(s => new Date(s.clientTs) >= lastWeek)
    const prevWeekSessions = sessions.filter(s => 
      new Date(s.clientTs) >= twoWeeksAgo && new Date(s.clientTs) < lastWeek
    )

    const lastWeekTime = lastWeekSessions.reduce((sum, s) => sum + s.durationSeconds, 0)
    const prevWeekTime = prevWeekSessions.reduce((sum, s) => sum + s.durationSeconds, 0)

    // Topic revisits
    const topicCounts = {}
    sessions.forEach(s => {
      const topic = s.topic.toLowerCase()
      topicCounts[topic] = (topicCounts[topic] || 0) + 1
    })
    const revisitedTopics = Object.entries(topicCounts).filter(([_, count]) => count > 1)

    // Consistency pattern (last 4 weeks)
    const weeklyActivity = []
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
      const weekSessions = sessions.filter(s => {
        const date = new Date(s.clientTs)
        return date >= weekStart && date < weekEnd
      })
      weeklyActivity.push({
        week: `W${4-i}`,
        sessions: weekSessions.length,
        hours: weekSessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 3600
      })
    }

    // Learning velocity trend
    const velocityChange = prevWeekTime > 0 
      ? ((lastWeekTime - prevWeekTime) / prevWeekTime * 100).toFixed(1)
      : lastWeekTime > 0 ? 100 : 0

    return {
      lastWeekTime,
      prevWeekTime,
      velocityChange,
      revisitedTopics,
      weeklyActivity,
      totalSessions: sessions.length,
      avgSessionLength: sessions.reduce((sum, s) => sum + s.durationSeconds, 0) / sessions.length / 60
    }
  }, [sessions])

  const chartData = Object.entries(data).map(([key, value]) => ({
    name: key.replace(/([A-Z])/g, ' $1').trim(),
    score: value.score,
    weight: value.weight,
    weightedScore: (value.score * value.weight) / 100
  }))

  // Radar chart data
  const radarData = Object.entries(data).map(([key, value]) => ({
    metric: key.replace(/([A-Z])/g, ' $1').trim().substring(0, 10),
    value: value.score
  }))

  const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899']
  const totalWeightedScore = chartData.reduce((sum, item) => sum + item.weightedScore, 0)

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="glass-card rounded-xl p-8 bg-gradient-to-br from-primary-50 to-purple-50">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block"
          >
            <div className="text-7xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent mb-3">
              {Math.round(totalWeightedScore)}
            </div>
            <div className="text-gray-700 font-semibold text-lg mb-4">Authenticity Score</div>
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg">
              <Award className="w-5 h-5" />
              <span>{skill.score >= 75 ? 'Established' : skill.score >= 50 ? 'Evolving' : 'Tentative'}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Insights Section */}
      {insights && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Brain className="w-6 h-6 mr-2 text-purple-600" />
            Learning Insights
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Learning Velocity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-5 h-5 text-blue-600" />
                {parseFloat(insights.velocityChange) >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {Math.round(insights.lastWeekTime / 3600)}h
              </div>
              <div className="text-xs text-gray-600 mb-2">Learning Velocity (Last Week)</div>
              <div className={`text-xs font-semibold ${parseFloat(insights.velocityChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {parseFloat(insights.velocityChange) > 0 ? '+' : ''}{insights.velocityChange}% vs prev week
              </div>
            </motion.div>

            {/* Consistency Pattern */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {Math.round(skill.consistencyScore)}%
              </div>
              <div className="text-xs text-gray-600 mb-2">Consistency Score</div>
              <div className="text-xs text-gray-500">
                {insights.weeklyActivity[insights.weeklyActivity.length - 1].sessions} sessions this week
              </div>
            </motion.div>

            {/* Topic Revisits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <Repeat className="w-5 h-5 text-purple-600" />
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {insights.revisitedTopics.length}
              </div>
              <div className="text-xs text-gray-600 mb-2">Topics Revisited</div>
              <div className="text-xs text-gray-500">
                {insights.revisitedTopics.length > 0 
                  ? `Max: ${Math.max(...insights.revisitedTopics.map(([_, c]) => c))}x on one topic`
                  : 'No revisits yet'
                }
              </div>
            </motion.div>

            {/* Avg Session Length */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {Math.round(insights.avgSessionLength)}m
              </div>
              <div className="text-xs text-gray-600 mb-2">Avg Session Length</div>
              <div className="text-xs text-gray-500">
                Across {insights.totalSessions} sessions
              </div>
            </motion.div>
          </div>

          {/* Weekly Activity Trend */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">4-Week Activity Trend</h4>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={insights.weeklyActivity}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sessions" 
                  stroke="#0ea5e9" 
                  fill="url(#colorSessions)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Most Revisited Topics */}
          {insights.revisitedTopics.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Most Revisited Topics</h4>
              <div className="space-y-2">
                {insights.revisitedTopics.slice(0, 5).map(([topic, count]) => (
                  <div key={topic} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
                    <span className="text-sm text-gray-700 capitalize">{topic}</span>
                    <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                      {count}x
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Component Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11 }}
                angle={-15}
                textAnchor="end"
                height={80}
              />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px'
                }}
              />
              <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Chart */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Skill Profile Radar</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Radar 
                name="Score" 
                dataKey="value" 
                stroke="#0ea5e9" 
                fill="#0ea5e9" 
                fillOpacity={0.6} 
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Detailed Component Analysis</h3>
        <div className="space-y-4">
          {Object.entries(data).map(([key, value], index) => {
            const name = key.replace(/([A-Z])/g, ' $1').trim()
            const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1)
            
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{capitalizedName}</h4>
                    <p className="text-sm text-gray-600">{value.description}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-3xl font-bold" style={{ color: colors[index % colors.length] }}>
                      {value.score}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">{value.weight}% weight</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                        style={{ 
                          width: `${value.score}%`,
                          backgroundColor: colors[index % colors.length]
                        }}
                      >
                        <div className="absolute inset-0 bg-white opacity-20 animate-pulse" />
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-gray-700 min-w-[60px] text-right">
                    +{((value.score * value.weight) / 100).toFixed(1)} pts
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Scoring Methodology */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Info className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">How Scores Are Calculated</h4>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              Your authenticity score is computed using deterministic, transparent heuristics. 
              Each component measures a specific aspect of your learning behavior:
            </p>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li><strong>Consistency:</strong> Session frequency and regularity over time</li>
              <li><strong>Depth:</strong> Code complexity, LOC, test coverage, or word count</li>
              <li><strong>Progression:</strong> Improvement trends and skill evolution phases</li>
              <li><strong>External Proof:</strong> GitHub commits, peer reviews, artifacts</li>
              <li><strong>Engagement:</strong> Session length, note detail, and reflection quality</li>
            </ul>
            <p className="text-sm text-gray-600 mt-3 italic">
              All calculations are explainable and auditable. No black-box ML algorithms.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScoreBreakdown
