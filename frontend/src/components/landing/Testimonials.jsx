import React from 'react'
import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Rajesh Kumar',
    role: 'Software Developer',
    company: 'Tech Startup',
    content: 'Skill Ledger helped me prove my self-learning journey to recruiters. They could see my consistency and progression, not just final projects.',
    avatar: 'RK'
  },
  {
    name: 'Ananya Singh',
    role: 'Data Science Student',
    company: 'IIT Delhi',
    content: 'Unlike certificates, Skill Ledger shows the struggle, the revisits, the growth. It made my learning story credible and authentic.',
    avatar: 'AS'
  },
  {
    name: 'Michael Chen',
    role: 'Hiring Manager',
    company: 'Fortune 500',
    content: 'We use Skill Ledger capsules to verify candidates. It reveals discipline and genuine effort—far better than resumes alone.',
    avatar: 'MC'
  }
]

const Testimonials = () => {
  return (
    <section className="section-padding bg-gradient-to-br from-primary-50 to-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Trusted by <span className="gradient-text">Learners & Employers</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands who are proving their learning journey with Skill Ledger
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 border-2 border-neutral-200 hover:border-primary-300 hover:shadow-xl transition-all duration-300"
            >
              <Quote className="w-10 h-10 text-primary-300 mb-6" />
              
              <p className="text-gray-700 leading-relaxed mb-6 italic">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role} • {testimonial.company}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
