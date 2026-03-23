import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Clock, Lock, ChevronRight, Paperclip, Info } from 'lucide-react'
import { formatDate, formatDuration, getPhaseColor } from '../../utils/helpers'
import { useVirtualizer } from '@tanstack/react-virtual'
import SessionDetail from './SessionDetail'

const Timeline = ({ sessions }) => {
  const [selectedSession, setSelectedSession] = useState(null)
  
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.clientTs || b.client_ts) - new Date(a.clientTs || a.client_ts)
  )

  const phases = ['Exposure', 'Confusion', 'Learning', 'Integration', 'Proficiency']
  const phaseDescriptions = {
    Exposure: 'First contact with new concepts — reading, watching, exploring.',
    Confusion: 'Grappling with complexity — asking questions, feeling stuck.',
    Learning: 'Active practice — building, experimenting, making mistakes.',
    Integration: 'Connecting dots — applying knowledge across contexts.',
    Proficiency: 'Mastery — teaching others, contributing, creating fluently.',
  }
  const phaseStats = phases.map(phase => ({
    phase,
    count: sessions.filter(s => s.phase === phase).length
  }))

  // ─── Virtualized session list ────────────────────────────────────────────
  const parentRef = useRef(null)
  const virtualizer = useVirtualizer({
    count: sortedSessions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 5,
  })

  return (
    <div className="space-y-6">
      {/* Phase Progress */}
      <div className="glass-card glass-glow rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Learning Phase Distribution</h3>
        <div className="space-y-3">
          {phaseStats.map(({ phase, count }) => (
            <div key={phase}>
              <div className="flex items-center justify-between text-sm mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-300">{phase}</span>
                  <span className="text-xs text-gray-500 hidden md:inline" title={phaseDescriptions[phase]}>
                    — {phaseDescriptions[phase]}
                  </span>
                </div>
                <span className="text-gray-400">{count} sessions</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${sessions.length > 0 ? (count / sessions.length) * 100 : 0}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`${getPhaseColor(phase)} h-2 rounded-full`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Phase model explanation */}
        <div className="mt-5 pt-4 border-t border-white/5">
          <div className="flex items-start space-x-2">
            <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-500 leading-relaxed">
              <strong className="text-gray-400">DTCS Phase Model:</strong> Each session is assigned a learning phase 
              when you log it. The phases represent your learning journey from initial <em>Exposure</em> through 
              <em> Confusion</em> and active <em>Learning</em>, into <em>Integration</em> where concepts connect, 
              and finally <em>Proficiency</em> where you can teach and create fluently.
            </p>
          </div>
        </div>
      </div>

      {/* Timeline — Virtualized for performance */}
      <div className="glass-card glass-glow rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Session Timeline ({sortedSessions.length} sessions)</h3>
        <div 
          ref={parentRef} 
          className="relative overflow-auto"
          style={{ maxHeight: '600px' }}
        >
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-300/50 via-blue-300/50 to-green-300/50" />

          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const session = sortedSessions[virtualRow.index]
              return (
                <div
                  key={session.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="pl-16 pr-2 py-3"
                >
                  {/* Phase dot */}
                  <div className={`absolute left-3 top-4 w-6 h-6 rounded-full ${getPhaseColor(session.phase)} border-4 border-[#0c0a13] shadow-lg`} />

                  <button
                    onClick={() => setSelectedSession(session)}
                    className="w-full text-left glass border border-white/[0.06] rounded-xl p-4 hover:border-primary-500/20 hover:bg-white/[0.04] transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-white truncate">{session.topic}</h4>
                          {(session.proof_of_work || session.proofs) && (session.proof_of_work || session.proofs).length > 0 && (
                            <span className="flex items-center text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                              <Paperclip className="w-3 h-3 mr-1" />
                              {(session.proof_of_work || session.proofs).length}
                            </span>
                          )}
                        </div>
                        {session.notes && (
                          <p className="text-sm text-gray-400 mb-2 line-clamp-1">
                            {session.notes.length > 100 ? `${session.notes.substring(0, 100)}...` : session.notes}
                          </p>
                        )}
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDuration(session.duration_seconds || session.durationSeconds)}
                          </span>
                          <span>{formatDate(session.client_ts || session.clientTs)}</span>
                          <span className={`px-2 py-0.5 rounded ${getPhaseColor(session.phase)} text-white font-semibold`}>
                            {session.phase}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Lock className="w-4 h-4 text-green-600" />
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-400 transition-colors" />
                      </div>
                    </div>
                  </button>
                </div>
              )
            })}
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
