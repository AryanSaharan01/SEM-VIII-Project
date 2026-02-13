import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Lock, ChevronRight, Github, FileText, Paperclip } from 'lucide-react'
import { formatDate, formatDuration, getPhaseColor } from '../../utils/helpers'
import SessionDetail from './SessionDetail'

const Timeline = ({ sessions }) => {
  const [selectedSession, setSelectedSession] = useState(null)
  
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
        <h3 className="text-xl font-bold text-gray-900 mb-6">Session Timeline ({sortedSessions.length} sessions)</h3>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-300 via-blue-300 to-green-300" />

          <div className="space-y-4">
            {sortedSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="relative pl-16"
              >
                {/* Phase dot */}
                <div className={`absolute left-3 top-2 w-6 h-6 rounded-full ${getPhaseColor(session.phase)} border-4 border-white shadow-lg`} />

                <button
                  onClick={() => setSelectedSession(session)}
                  className="w-full text-left bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-primary-300 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">{session.topic}</h4>
                        {session.proofs && session.proofs.length > 0 && (
                          <span className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            <Paperclip className="w-3 h-3 mr-1" />
                            {session.proofs.length}
                          </span>
                        )}
                      </div>
                      {session.notes && (
                        <p className="text-sm text-gray-600 mb-2">
                          {session.notes.length > 100 ? `${session.notes.substring(0, 100)}...` : session.notes}
                        </p>
                      )}
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
                    <div className="flex items-center space-x-2 ml-4">
                      <Lock className="w-4 h-4 text-green-600" />
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Session Detail Modal */}
      {selectedSession && (
        <SessionDetail
          onClose={() => setSelectedSession(null)}
          session={selectedSession}
        />
      )}
    </div>
  )
}

export default Timeline
