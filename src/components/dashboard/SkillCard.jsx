import React from 'react'
import { motion } from 'framer-motion'
import { Code, FileText, TrendingUp } from 'lucide-react'
import { getScoreLabel } from '../../utils/helpers'

const SkillCard = ({ skill, isSelected, onClick }) => {
  const { label, color, bg } = getScoreLabel(skill.score)
  
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg transition-all ${
        isSelected 
          ? 'bg-primary-50 border-2 border-primary-600 shadow-lg' 
          : 'bg-white border-2 border-gray-200 hover:border-primary-300 shadow-md hover:shadow-lg'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          {skill.category === 'coding' ? (
            <Code className="w-5 h-5 text-primary-600" />
          ) : (
            <FileText className="w-5 h-5 text-purple-600" />
          )}
          <h3 className="font-semibold text-gray-900 text-sm">{skill.name}</h3>
        </div>
        <div className={`${bg} ${color} px-2 py-1 rounded text-xs font-bold`}>
          {skill.score}
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>{skill.totalSessions} sessions</span>
        <span>{skill.totalHours}h</span>
      </div>
      
      <div className="mt-2 flex items-center text-xs text-gray-500">
        <TrendingUp className="w-3 h-3 mr-1" />
        <span>{label}</span>
      </div>
    </motion.button>
  )
}

export default SkillCard
