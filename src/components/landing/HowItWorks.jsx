import React from 'react'
import { motion } from 'framer-motion'
import { UserPlus, FolderPlus, Edit3, Lock, BarChart2, Send } from 'lucide-react'

const steps = [
  {
    icon: UserPlus,
    number: '01',
    title: 'Sign Up',
    description: 'Create your account using email + OTP authentication. No passwords, no complexity.'
  },
  {
    icon: FolderPlus,
    number: '02',
    title: 'Create Skills',
    description: 'Add skills you want to track: Java, Python, Web Dev, DSA, or any learning goal.'
  },
  {
    icon: Edit3,
    number: '03',
    title: 'Log Sessions',
    description: 'Record learning sessions with topic, time spent, difficulty, and reflection notes.'
  },
  {
    icon: Lock,
    number: '04',
    title: 'Auto-Lock',
    description: 'Sessions are automatically timestamped and hashed. No editing or backdating possible.'
  },
  {
    icon: BarChart2,
    number: '05',
    title: 'Analyze Patterns',
    description: 'View insights on consistency, topic revisits, learning velocity, and progression.'
  },
  {
    icon: Send,
    number: '06',
    title: 'Share Capsule',
    description: 'Generate shareable skill capsules with verification hash. Send to employers or peers.'
  }
]

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="section-padding bg-gradient-to-br from-neutral-50 to-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            How <span className="gradient-text">Skill Ledger</span> Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Six simple steps to create an immutable record of your learning journey
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && index % 3 !== 2 && (
                <div className="hidden lg:block absolute top-16 left-full w-8 h-0.5 bg-gradient-to-r from-primary-300 to-transparent -z-10"></div>
              )}
              
              <div className="bg-white rounded-2xl p-8 border-2 border-neutral-200 hover:border-primary-300 hover:shadow-xl transition-all duration-300 h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-5xl font-bold text-neutral-200">
                    {step.number}
                  </div>
                </div>
                
                <h3 className="text-2xl font-semibold mb-3 text-gray-800">
                  {step.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
