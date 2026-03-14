import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, TrendingUp, Flame, Target } from 'lucide-react'
import { formatDate } from '../../utils/helpers'

const ActivityHeatmap = ({ data }) => {
  const [hoveredDay, setHoveredDay] = useState(null)

  const getColor = (count) => {
    if (count === 0) return 'bg-gray-100'
    if (count === 1) return 'bg-emerald-200'
    if (count === 2) return 'bg-emerald-400'
    if (count === 3) return 'bg-emerald-600'
    if (count >= 4) return 'bg-emerald-800'
    return 'bg-gray-100'
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-5 shadow-md hover:shadow-lg transition-all border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Total Sessions</span>
            <Calendar className="w-5 h-5 text-primary-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{getTotalSessions()}</div>
          <div className="text-xs text-gray-500 mt-1">Last 13 weeks</div>
        </div>

        <div className="bg-orange-50 rounded-lg p-5 shadow-md hover:shadow-lg transition-all border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-orange-900 text-sm font-medium">Current Streak</span>
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-orange-600">{getStreak()}</div>
          <div className="text-xs text-orange-700 mt-1">Days in a row 🔥</div>
        </div>

        <div className="bg-white rounded-lg p-5 shadow-md hover:shadow-lg transition-all border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Best Streak</span>
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{getBestStreak()}</div>
          <div className="text-xs text-gray-500 mt-1">Personal best</div>
        </div>

        <div className="bg-white rounded-lg p-5 shadow-md hover:shadow-lg transition-all border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Avg per Week</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {Math.round(getTotalSessions() / 13)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Sessions</div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Activity Heatmap - Last 13 Weeks</h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Less</span>
            {[0, 1, 2, 3, 4].map(level => (
              <div key={level} className={`w-3 h-3 ${getColor(level)} rounded`} />
            ))}
            <span className="text-xs text-gray-500">More</span>
          </div>
        </div>
        
        <div className="w-full overflow-x-auto pb-6 pt-4">
          <div className="min-w-full inline-block">
            {/* Month labels */}
            <div className="flex mb-3 pl-12">
              {data.map((week, weekIndex) => {
                if (week[0]) {
                  const date = new Date(week[0].date)
                  const isFirstOfMonth = date.getDate() <= 7
                  return (
                    <div key={weekIndex} className="flex-1 text-left" style={{ minWidth: '14px' }}>
                      {isFirstOfMonth && (
                        <span className="text-xs text-gray-600 font-medium">
                          {months[date.getMonth()]}
                        </span>
                      )}
                    </div>
                  )
                }
                return <div key={weekIndex} className="flex-1" style={{ minWidth: '14px' }} />
              })}
            </div>

            {/* Heatmap grid */}
            {weekDays.map((dayName, dayIndex) => (
              <div key={dayName} className="flex items-center mb-2 group">
                <div className="w-12 text-xs text-gray-600 font-medium pr-2">
                  {dayName}
                </div>
                <div className="flex gap-1 flex-1 relative">
                  {data.map((week, weekIndex) => {
                    const day = week[dayIndex]
                    return day ? (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`w-3.5 h-3.5 ${getColor(day.count)} rounded cursor-pointer transition-all hover:ring-2 hover:ring-primary-400 hover:scale-125 relative z-20`}
                        style={{ minWidth: '14px', minHeight: '14px' }}
                      >
                        {hoveredDay === day && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 pointer-events-none z-50">
                            <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-2xl border border-gray-700">
                              <div className="font-semibold mb-1">{formatDate(day.date)}</div>
                              <div className="text-emerald-400 font-medium">
                                {day.count} session{day.count !== 1 ? 's' : ''}
                              </div>
                              {day.sessions && day.sessions.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-gray-700 max-w-xs">
                                  <div className="text-gray-300 text-xs">
                                    {day.sessions.slice(0, 2).map((s, i) => (
                                      <div key={i} className="truncate">• {s.topic}</div>
                                    ))}
                                    {day.sessions.length > 2 && (
                                      <div className="text-gray-400">+{day.sessions.length - 2} more</div>
                                    )}
                                  </div>
                                </div>
                              )}
                              {/* Arrow */}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                                <div className="w-2 h-2 bg-gray-900 rotate-45 border-r border-b border-gray-700"></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div 
                        key={`${weekIndex}-${dayIndex}`} 
                        className="w-3.5 h-3.5 bg-gray-100 rounded" 
                        style={{ minWidth: '14px', minHeight: '14px' }}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional insights */}
        <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary-600">
              {data.flat().filter(d => d.count > 0).length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Active Days</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">
              {Math.round((data.flat().filter(d => d.count > 0).length / (13 * 7)) * 100)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">Consistency</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {Math.max(...data.flat().map(d => d.count))}
            </div>
            <div className="text-xs text-gray-500 mt-1">Max in a Day</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {data.flat().filter(d => d.count >= 2).length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Multi-session Days</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActivityHeatmap
