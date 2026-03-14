import React from 'react'
import { motion } from 'framer-motion'
import { Code, FileText, TrendingUp, Clock, Target } from 'lucide-react'
import { getScoreLabel } from '../../utils/helpers'

const SkillCard = ({ skill, isSelected, onClick }) => {
  const { label, color, bg } = getScoreLabel(skill.score)
  
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
        isSelected 
          ? 'bg-primary-50 border-2 border-primary-500 shadow-lg' 
          : 'bg-white border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2 flex-1">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            skill.category === 'coding' ? 'bg-primary-600' : 'bg-emerald-600'
          }`}>
            {skill.category === 'coding' ? (
              <Code className="w-4 h-4 text-white" />
            ) : (
              <FileText className="w-4 h-4 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-sm truncate">{skill.name}</h3>
            <p className="text-xs text-gray-500 capitalize">{skill.category}</p>
          </div>
        </div>
        <div className={`${bg} ${color} px-2.5 py-1 rounded-lg font-bold text-sm`}>
          {skill.score}
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs font-medium mb-2">
        <span className="text-gray-600 flex items-center">
          <Target className="w-3 h-3 mr-1" />
          {skill.totalSessions} sessions
        </span>
        <span className="text-gray-600 flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          {skill.totalHours}h
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${
            isSelected ? 'bg-primary-600' : 'bg-primary-500'
          }`}
          style={{ width: `${Math.min((skill.score / 100) * 100, 100)}%` }}
        />
      </div>
      
      <div className="mt-2 flex items-center text-xs">
        <TrendingUp className={`w-3 h-3 mr-1 ${isSelected ? 'text-primary-600' : 'text-gray-500'}`} />
        <span className={isSelected ? 'text-primary-700 font-medium' : 'text-gray-500'}>{label}</span>
      </div>
    </motion.button>
  )
}

export default SkillCard
