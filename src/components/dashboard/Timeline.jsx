import React from 'react'
import { motion } from 'framer-motion'
import { Clock, Lock } from 'lucide-react'
import { formatDate, formatDuration, getPhaseColor } from '../../utils/helpers'

const Timeline = ({ sessions }) => {
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.clientTs) - new Date(a.clientTs)
  )

  const phases = ['Exposure', 'Confusion', 'Learning', 'Integration', 'Proficiency']
  const phaseStats = phases.map(phase => ({
    phase,
    count: sessions.filter(s => s.phase === phase).length
  }))

  return (
    <div className="space-y-6">
      {/* Phase Progress */}
      <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Learning Phase Distribution</h3>
        <div className="space-y-3">
          {phaseStats.map(({ phase, count }) => (
            <div key={phase}>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">{phase}</span>
                <span className="text-gray-600">{count} sessions</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${getPhaseColor(phase)} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${(count / sessions.length) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Session Timeline</h3>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-300 via-blue-300 to-green-300" />

          <div className="space-y-6">
            {sortedSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative pl-16"
              >
                {/* Phase dot */}
                <div className={`absolute left-3 top-0 w-6 h-6 rounded-full ${getPhaseColor(session.phase)} border-4 border-white shadow-lg`} />

                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{session.topic}</h4>
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDuration(session.durationSeconds)}
                        </span>
                        <span>{formatDate(session.clientTs)}</span>
                        <span className={`px-2 py-0.5 rounded ${getPhaseColor(session.phase)} text-white font-semibold`}>
                          {session.phase}
                        </span>
                      </div>
                    </div>
                    <Lock className="w-4 h-4 text-green-600" />
                  </div>

                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">{session.notes}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500 font-mono">
                      Hash: {session.entryHash.substring(0, 16)}...
                    </div>
                    {session.prevHash && (
                      <div className="text-xs text-gray-400">
                        ← Linked
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Timeline
