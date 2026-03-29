import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Quote, Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Rajesh Kumar',
    role: 'Software Developer',
    company: 'Tech Startup',
    content: 'Skill Ledger helped me prove my self-learning journey to recruiters. They could see my consistency and progression, not just final projects.',
    avatar: 'RK',
    gradient: 'from-primary-400 to-emerald-400'
  },
  {
    name: 'Ananya Singh',
    role: 'Data Science Student',
    company: 'IIT Delhi',
    content: 'Unlike certificates, Skill Ledger shows the struggle, the revisits, the growth. It made my learning story credible and authentic.',
    avatar: 'AS',
    gradient: 'from-violet-400 to-pink-400'
  },
  {
    name: 'Michael Chen',
    role: 'Hiring Manager',
    company: 'Fortune 500',
    content: 'We use Skill Ledger capsules to verify candidates. It reveals discipline and genuine effort—far better than resumes alone.',
    avatar: 'MC',
    gradient: 'from-amber-400 to-orange-400'
  }
]

const TestimonialCard = ({ testimonial, index }) => {
  const cardRef = useRef(null)
  const isInView = useInView(cardRef, { once: true, margin: "-60px" })

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay: index * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <div className="glass-card glass-glow p-8 h-full shine-effect flex flex-col">
        {/* Stars */}
        <div className="flex gap-1 mb-5">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0, rotate: -180 }}
              animate={isInView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.06, type: "spring", stiffness: 300 }}
            >
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </motion.div>
          ))}
        </div>

        {/* Quote icon */}
        <Quote className="w-8 h-8 text-primary-500/20 mb-4" />
        
        <p className="text-gray-300 leading-relaxed mb-8 flex-1 text-[0.9rem]">
          "{testimonial.content}"
        </p>
        
        <div className="flex items-center gap-4 pt-5 border-t border-white/5">
          <div className={`w-12 h-12 bg-gradient-to-br ${testimonial.gradient} rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
            {testimonial.avatar}
          </div>
          <div>
            <div className="font-semibold text-white text-sm">{testimonial.name}</div>
            <div className="text-xs text-gray-500">{testimonial.role} • {testimonial.company}</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const Testimonials = () => {
  const headingRef = useRef(null)
  const isHeadingInView = useInView(headingRef, { once: true, margin: "-100px" })

  return (
    <section className="section-padding relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container-custom relative">
        <div ref={headingRef} className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isHeadingInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-block px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-widest text-primary-400 glass glass-glow mb-6"
          >
            Testimonials
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={isHeadingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight"
          >
            <span className="text-white">Trusted by </span>
            <span className="gradient-text">Learners & Employers</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={isHeadingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg text-gray-400 max-w-2xl mx-auto"
          >
            Join thousands who are proving their learning journey with Skill Ledger
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
