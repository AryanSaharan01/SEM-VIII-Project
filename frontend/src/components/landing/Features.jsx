import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Lock, BarChart3, Calendar, Share2, GitBranch, FileText } from 'lucide-react'

const features = [
  {
    icon: Lock,
    title: 'Immutable Records',
    description: 'Every session is timestamped and cryptographically hashed. Once logged, it cannot be edited or backdated.',
    gradient: 'from-emerald-400 to-emerald-600',
    glow: 'rgba(52, 211, 153, 0.3)',
    iconColor: 'text-emerald-400',
    shadowColor: 'rgba(52, 211, 153, 0.15)',
  },
  {
    icon: BarChart3,
    title: 'Pattern Analysis',
    description: 'Detects consistency, topic revisits, learning gaps, and explanation quality improvements over time.',
    gradient: 'from-primary-400 to-primary-600',
    glow: 'rgba(32, 128, 145, 0.3)',
    iconColor: 'text-primary-400',
    shadowColor: 'rgba(32, 128, 145, 0.15)',
  },
  {
    icon: Calendar,
    title: 'Activity Heatmap',
    description: 'Visual 13-week calendar showing your learning consistency and commitment to skill development.',
    gradient: 'from-violet-400 to-violet-600',
    glow: 'rgba(139, 92, 246, 0.3)',
    iconColor: 'text-violet-400',
    shadowColor: 'rgba(139, 92, 246, 0.15)',
  },
  {
    icon: Share2,
    title: 'Skill Capsules',
    description: 'Generate shareable, read-only proof pages with your complete learning journey and verification hash.',
    gradient: 'from-amber-400 to-orange-500',
    glow: 'rgba(251, 191, 36, 0.3)',
    iconColor: 'text-amber-400',
    shadowColor: 'rgba(251, 191, 36, 0.15)',
  },
  {
    icon: GitBranch,
    title: 'GitHub Integration',
    description: 'Connect your public repository to enrich your timeline with commit history (read-only, optional).',
    gradient: 'from-gray-300 to-gray-500',
    glow: 'rgba(156, 163, 175, 0.3)',
    iconColor: 'text-gray-300',
    shadowColor: 'rgba(156, 163, 175, 0.15)',
  },
  {
    icon: FileText,
    title: 'Reflection Notes',
    description: 'Document your understanding with code snippets and notes. Longer, structured notes increase credibility.',
    gradient: 'from-sky-400 to-blue-500',
    glow: 'rgba(56, 189, 248, 0.3)',
    iconColor: 'text-sky-400',
    shadowColor: 'rgba(56, 189, 248, 0.15)',
  }
]

// Clean feature card — no 3D tilt hover
const FeatureCard = ({ feature, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: index * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <div 
        className="glass-card p-8 h-full shine-effect"
        style={{
          boxShadow: `0 8px 32px ${feature.shadowColor}, 0 4px 12px rgba(0,0,0,0.3)`,
        }}
      >
        {/* Icon container */}
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} p-[1px] mb-6`}>
          <div className="w-full h-full rounded-[13px] bg-[#0d0b14] flex items-center justify-center">
            <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
          </div>
        </div>
        
        <h3 className="text-xl font-bold mb-3 text-white group-hover:gradient-text transition-all duration-300">
          {feature.title}
        </h3>
        
        <p className="text-gray-400 leading-relaxed text-sm">
          {feature.description}
        </p>

        {/* Bottom accent line */}
        <div className="mt-6 h-[2px] w-0 group-hover:w-full bg-gradient-to-r from-primary-500 to-transparent transition-all duration-700 ease-out" />
      </div>
    </motion.div>
  )
}

const Features = () => {
  const headingRef = useRef(null)
  const isInView = useInView(headingRef, { once: true, margin: "-100px" })

  return (
    <section className="section-padding relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary-500/3 via-transparent to-transparent pointer-events-none" />

      <div className="container-custom relative">
        <div ref={headingRef} className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-block px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-widest text-primary-400 glass glass-glow mb-6"
          >
            Core Features
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight"
          >
            <span className="text-white">Built for </span>
            <span className="gradient-text">Authentic Learning</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg text-gray-400 max-w-2xl mx-auto"
          >
            Skill Ledger doesn't judge intelligence or correctness. It verifies honesty and progression through behavioral patterns.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
