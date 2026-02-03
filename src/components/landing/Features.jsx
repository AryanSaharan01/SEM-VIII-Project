import React from 'react'
import { motion } from 'framer-motion'
import { Lock, BarChart3, Calendar, Share2, GitBranch, FileText } from 'lucide-react'

const features = [
  {
    icon: Lock,
    title: 'Immutable Records',
    description: 'Every session is timestamped and cryptographically hashed. Once logged, it cannot be edited or backdated.',
    color: 'text-green-600',
    bg: 'bg-green-50'
  },
  {
    icon: BarChart3,
    title: 'Pattern Analysis',
    description: 'Detects consistency, topic revisits, learning gaps, and explanation quality improvements over time.',
    color: 'text-primary-600',
    bg: 'bg-primary-50'
  },
  {
    icon: Calendar,
    title: 'Activity Heatmap',
    description: 'Visual 13-week calendar showing your learning consistency and commitment to skill development.',
    color: 'text-purple-600',
    bg: 'bg-purple-50'
  },
  {
    icon: Share2,
    title: 'Skill Capsules',
    description: 'Generate shareable, read-only proof pages with your complete learning journey and verification hash.',
    color: 'text-orange-600',
    bg: 'bg-orange-50'
  },
  {
    icon: GitBranch,
    title: 'GitHub Integration',
    description: 'Connect your public repository to enrich your timeline with commit history (read-only, optional).',
    color: 'text-gray-700',
    bg: 'bg-gray-50'
  },
  {
    icon: FileText,
    title: 'Reflection Notes',
    description: 'Document your understanding with code snippets and notes. Longer, structured notes increase credibility.',
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  }
]

const Features = () => {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Built for <span className="gradient-text">Authentic Learning</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Skill Ledger doesn't judge intelligence or correctness. It verifies honesty and progression through behavioral patterns.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-8 rounded-2xl border-2 border-neutral-200 hover:border-primary-300 hover:shadow-xl transition-all duration-300 bg-white"
            >
              <div className={`w-14 h-14 ${feature.bg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-7 h-7 ${feature.color}`} />
              </div>
              
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
