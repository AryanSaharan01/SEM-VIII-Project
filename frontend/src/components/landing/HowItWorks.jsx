import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { UserPlus, FolderPlus, Edit3, Lock, BarChart2, Send } from 'lucide-react'

const steps = [
  {
    icon: UserPlus,
    number: '01',
    title: 'Sign Up',
    description: 'Create your account using email + OTP authentication. No passwords, no complexity.',
    color: 'from-blue-400 to-blue-600',
  },
  {
    icon: FolderPlus,
    number: '02',
    title: 'Create Skills',
    description: 'Add skills you want to track: Java, Python, Web Dev, DSA, or any learning goal.',
    color: 'from-violet-400 to-violet-600',
  },
  {
    icon: Edit3,
    number: '03',
    title: 'Log Sessions',
    description: 'Record learning sessions with topic, time spent, difficulty, and reflection notes.',
    color: 'from-emerald-400 to-emerald-600',
  },
  {
    icon: Lock,
    number: '04',
    title: 'Auto-Lock',
    description: 'Sessions are automatically timestamped and hashed. No editing or backdating possible.',
    color: 'from-amber-400 to-amber-600',
  },
  {
    icon: BarChart2,
    number: '05',
    title: 'Analyze Patterns',
    description: 'View insights on consistency, topic revisits, learning velocity, and progression.',
    color: 'from-pink-400 to-pink-600',
  },
  {
    icon: Send,
    number: '06',
    title: 'Share Capsule',
    description: 'Generate shareable skill capsules with verification hash. Send to employers or peers.',
    color: 'from-primary-400 to-primary-600',
  }
]

const StepCard = ({ step, index }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative group"
    >
      {/* Connector line between cards */}
      {index < steps.length - 1 && index % 3 !== 2 && (
        <div className="hidden lg:block absolute top-16 left-full w-6 z-20">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
            className="h-[2px] bg-gradient-to-r from-primary-500/50 to-primary-500/10 origin-left"
          />
        </div>
      )}
      
      <div className="glass-card glass-glow p-8 h-full shine-effect">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className={`w-14 h-14 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-lg`}>
              <step.icon className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="text-5xl font-extrabold text-white/[0.03] select-none leading-none">
            {step.number}
          </div>
        </div>
        
        <h3 className="text-xl font-bold mb-3 text-white">
          {step.title}
        </h3>
        
        <p className="text-gray-400 leading-relaxed text-sm">
          {step.description}
        </p>

        <div className="mt-6 flex items-center gap-2">
          <div className="glow-dot" />
          <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Step {step.number}</span>
        </div>
      </div>
    </motion.div>
  )
}

const HowItWorks = () => {
  const headingRef = useRef(null)
  const isHeadingInView = useInView(headingRef, { once: true, margin: "-100px" })

  return (
    <section id="how-it-works" className="section-padding relative overflow-hidden">
      {/* Subtle vertical line accent */}
      <div className="absolute left-1/2 top-40 bottom-40 w-[1px] bg-gradient-to-b from-transparent via-primary-500/15 to-transparent hidden lg:block" />

      <div className="container-custom">
        <div ref={headingRef} className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isHeadingInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-block px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-widest text-primary-400 glass glass-glow mb-6"
          >
            How It Works
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={isHeadingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight"
          >
            <span className="text-white">How </span>
            <span className="gradient-text">Skill Ledger</span>
            <span className="text-white"> Works</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={isHeadingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg text-gray-400 max-w-2xl mx-auto"
          >
            Six simple steps to create an immutable record of your learning journey
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <StepCard key={index} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
