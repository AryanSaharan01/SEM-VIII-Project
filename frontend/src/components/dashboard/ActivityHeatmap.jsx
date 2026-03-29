import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, TrendingUp, Flame, Target } from 'lucide-react'
import { formatDate } from '../../utils/helpers'

const ActivityHeatmap = ({ data }) => {
  const [hoveredDay, setHoveredDay] = useState(null)

  const getColor = (count) => {
    if (count === 0) return 'bg-white/5'
    if (count === 1) return 'bg-emerald-500/30'
    if (count === 2) return 'bg-emerald-500/50'
    if (count === 3) return 'bg-emerald-500/70'
    if (count >= 4) return 'bg-emerald-500'
    return 'bg-white/5'
  }

  const getTotalSessions = () => {
    return data.reduce((total, week) => 
      total + week.reduce((weekTotal, day) => weekTotal + day.count, 0), 0
    )
  }

  const getStreak = () => {
    let streak = 0
    const allDays = data.flat().reverse()
    for (const day of allDays) {
      if (day.count > 0) streak++
      else break
    }
    return streak
  }

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const getBestStreak = () => {
    let maxStreak = 0
    let currentStreak = 0
    const allDays = data.flat()
    for (const day of allDays) {
      if (day.count > 0) {
        currentStreak++
        maxStreak = Math.max(maxStreak, currentStreak)
      } else {
        currentStreak = 0
      }
    }
    return maxStreak
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Sessions</span>
            <Calendar className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">{getTotalSessions()}</div>
          <div className="text-xs text-gray-500">Last 13 weeks</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card rounded-2xl p-6 border-orange-500/15"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm font-medium">Current Streak</span>
            <Flame className="w-5 h-5 text-orange-400" />
          </div>
          <div className="text-3xl font-bold text-orange-400">{getStreak()}</div>
          <div className="text-xs text-gray-400">Days in a row 🔥</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="stat-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Best Streak</span>
            <Target className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white">{getBestStreak()}</div>
          <div className="text-xs text-gray-500">Personal best</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="stat-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Avg per Week</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white">
            {Math.round(getTotalSessions() / 13)}
          </div>
          <div className="text-xs text-gray-500">Sessions</div>
        </motion.div>
      </div>

      {/* Horizontal Heatmap */}
      <div className="glass-card glass-glow rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center justify-between">
          <span>Activity Heatmap - Last 13 Weeks</span>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Less</span>
            {[0, 1, 2, 3, 4].map(level => (
              <div key={level} className={`w-3 h-3 ${getColor(level)} rounded-sm`} />
            ))}
            <span className="text-xs text-gray-500">More</span>
          </div>
        </h3>
        
        <div className="overflow-x-auto pb-4">
          <div className="inline-flex flex-col min-w-full">
            {/* Week days on left */}
            <div className="flex">
              <div className="w-16 flex-shrink-0" />
              {/* Month labels */}
              <div className="flex-1 flex mb-2">
                {data.map((week, weekIndex) => {
                  if (week[0]) {
                    const date = new Date(week[0].date)
                    const isFirstOfMonth = date.getDate() <= 7
                    return (
                      <div key={weekIndex} className="flex-1 min-w-[12px]">
                        {isFirstOfMonth && (
                          <span className="text-xs text-gray-500 font-medium">
                            {months[date.getMonth()]}
                          </span>
                        )}
                      </div>
                    )
                  }
                  return <div key={weekIndex} className="flex-1 min-w-[12px]" />
                })}
              </div>
            </div>

            {/* Heatmap grid - Horizontal */}
            {weekDays.map((dayName, dayIndex) => (
              <div key={dayName} className="flex items-center mb-1">
                <div className="w-16 text-xs text-gray-400 font-medium flex-shrink-0">
                  {dayName}
                </div>
                <div className="flex space-x-1 flex-1">
                  {data.map((week, weekIndex) => {
                    const day = week[dayIndex]
                    return day ? (
                      <motion.div
                        key={`${weekIndex}-${dayIndex}`}
                        whileHover={{ scale: 1.5, zIndex: 10 }}
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`w-3 h-3 ${getColor(day.count)} rounded-sm cursor-pointer transition-all duration-200 relative`}
                      >
                        {hoveredDay === day && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-20 pointer-events-none">
                            <div className="bg-gray-900/95 backdrop-blur-md text-white text-xs rounded-xl px-3 py-2 whitespace-nowrap shadow-2xl shadow-black/40 border border-white/10">
                              <div className="font-semibold">{formatDate(day.date)}</div>
                              <div className="text-emerald-300">{day.count} session{day.count !== 1 ? 's' : ''}</div>
                              {day.sessions && day.sessions.length > 0 && (
                                <div className="mt-1 pt-1 border-t border-gray-700">
                                  <div className="text-gray-300 text-xs">
                                    {day.sessions.slice(0, 2).map(s => s.topic).join(', ')}
                                    {day.sessions.length > 2 && '...'}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <div key={`${weekIndex}-${dayIndex}`} className="w-3 h-3 bg-white/5 rounded-sm" />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional insights */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-400">
              {data.flat().filter(d => d.count > 0).length}
            </div>
            <div className="text-xs text-gray-500">Active Days</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">
              {Math.round((data.flat().filter(d => d.count > 0).length / (13 * 7)) * 100)}%
            </div>
            <div className="text-xs text-gray-500">Consistency</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">
              {Math.max(...data.flat().map(d => d.count))}
            </div>
            <div className="text-xs text-gray-500">Max in a Day</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-400">
              {data.flat().filter(d => d.count >= 2).length}
            </div>
            <div className="text-xs text-gray-500">Multi-session Days</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActivityHeatmap
