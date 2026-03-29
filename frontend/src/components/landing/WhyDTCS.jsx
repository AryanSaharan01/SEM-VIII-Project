import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { CheckCircle2, XCircle, Quote } from 'lucide-react'

const comparisons = [
  { feature: 'Proves Learning Journey', dtcs: true, traditional: false },
  { feature: 'Tamper-Proof Records', dtcs: true, traditional: false },
  { feature: 'Shows Consistency', dtcs: true, traditional: false },
  { feature: 'Tracks Progression', dtcs: true, traditional: false },
  { feature: 'Prevents Backdating', dtcs: true, traditional: false },
  { feature: 'Reveals Effort', dtcs: true, traditional: false }
]

const WhyDTCS = () => {
  const headingRef = useRef(null)
  const isHeadingInView = useInView(headingRef, { once: true, margin: "-100px" })
  const tableRef = useRef(null)
  const isTableInView = useInView(tableRef, { once: true, margin: "-80px" })

  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary-500/4 via-transparent to-transparent pointer-events-none" />

      <div className="container-custom">
        <div ref={headingRef} className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isHeadingInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-block px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-widest text-primary-400 glass glass-glow mb-6"
          >
            Why Choose Us
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={isHeadingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight"
          >
            <span className="text-white">Why Choose </span>
            <span className="gradient-text">Skill Ledger</span>
            <span className="text-white">?</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={isHeadingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg text-gray-400 max-w-2xl mx-auto"
          >
            Unlike certificates or portfolios, Skill Ledger proves authenticity through time-ordered, immutable evidence
          </motion.p>
        </div>

        <div className="max-w-4xl mx-auto" ref={tableRef}>
          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isTableInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="glass-card glass-glow overflow-hidden"
          >
            {/* Table Header */}
            <div className="grid grid-cols-3 p-6 border-b border-white/10 bg-white/[0.03]">
              <div className="col-span-1 text-sm font-semibold text-gray-400 uppercase tracking-wider">Feature</div>
              <div className="text-center">
                <div className="font-bold text-lg text-shimmer">Skill Ledger</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-gray-500">Traditional</div>
              </div>
            </div>

            {/* Table Rows */}
            {comparisons.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                animate={isTableInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.15 + index * 0.08, duration: 0.5 }}
                className={`grid grid-cols-3 p-6 items-center transition-colors duration-300 ${
                  index !== comparisons.length - 1 ? 'border-b border-white/5' : ''
                }`}
              >
                <div className="font-medium text-gray-300">
                  {item.feature}
                </div>
                <div className="flex justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={isTableInView ? { scale: 1 } : {}}
                    transition={{ delay: 0.3 + index * 0.08, type: "spring", stiffness: 200 }}
                  >
                    <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/25 shadow-lg shadow-emerald-500/10">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                  </motion.div>
                </div>
                <div className="flex justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={isTableInView ? { scale: 1 } : {}}
                    transition={{ delay: 0.3 + index * 0.08, type: "spring", stiffness: 200 }}
                  >
                    <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/15">
                      <XCircle className="w-5 h-5 text-red-400/60" />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Quote */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="mt-16 text-center relative"
          >
            <Quote className="w-12 h-12 text-primary-500/15 mx-auto mb-4" />
            <blockquote className="text-2xl md:text-3xl font-bold text-white/90 leading-snug max-w-3xl mx-auto">
              "Skill Ledger doesn't stop cheating—it makes cheating{' '}
              <span className="gradient-text relative">
                obvious
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-primary-400 to-primary-600"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                />
              </span>."
            </blockquote>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default WhyDTCS
