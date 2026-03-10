import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle } from 'lucide-react'

const comparisons = [
  {
    feature: 'Proves Learning Journey',
    dtcs: true,
    traditional: false
  },
  {
    feature: 'Tamper-Proof Records',
    dtcs: true,
    traditional: false
  },
  {
    feature: 'Shows Consistency',
    dtcs: true,
    traditional: false
  },
  {
    feature: 'Tracks Progression',
    dtcs: true,
    traditional: false
  },
  {
    feature: 'Prevents Backdating',
    dtcs: true,
    traditional: false
  },
  {
    feature: 'Reveals Effort',
    dtcs: true,
    traditional: false
  }
]

const WhyDTCS = () => {
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
            Why Choose <span className="gradient-text">Skill Ledger</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlike certificates or portfolios, Skill Ledger proves authenticity through time-ordered, immutable evidence
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl border-2 border-neutral-200 overflow-hidden shadow-xl"
          >
            <div className="grid grid-cols-3 bg-neutral-100 p-6 border-b-2 border-neutral-200">
              <div className="col-span-1"></div>
              <div className="text-center">
                <div className="font-bold text-lg text-primary-600">Skill Ledger</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-gray-600">Traditional</div>
              </div>
            </div>

            {comparisons.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`grid grid-cols-3 p-6 items-center ${index !== comparisons.length - 1 ? 'border-b border-neutral-200' : ''}`}
              >
                <div className="font-medium text-gray-800">
                  {item.feature}
                </div>
                <div className="flex justify-center">
                  <CheckCircle2 className="w-7 h-7 text-green-500" />
                </div>
                <div className="flex justify-center">
                  <XCircle className="w-7 h-7 text-red-400" />
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <blockquote className="text-2xl md:text-3xl font-semibold text-gray-800 italic">
              "Skill Ledger doesn't stop cheating—it makes cheating <span className="gradient-text">obvious</span>."
            </blockquote>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default WhyDTCS
