import React from 'react'
import { motion } from 'framer-motion'
import { Lock, Github, Twitter, Linkedin, Mail, ArrowUpRight, Heart } from 'lucide-react'

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Mail, href: '#', label: 'Email' },
  ]

  return (
    <footer className="relative overflow-hidden border-t border-white/[0.04]">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-radial from-primary-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="container-custom px-6 py-20 relative">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="relative">
                <div className="w-11 h-11 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -inset-1.5 bg-primary-500/15 rounded-2xl blur-lg -z-10" />
              </div>
              <span className="text-2xl font-bold text-shimmer tracking-tight">Skill Ledger</span>
            </motion.div>
            <p className="text-gray-500 leading-relaxed mb-8 max-w-md text-sm">
              Digital Time Capsule for Skills — Prove how you learned, not just that you claim to know it. 
              Built for authentic learners and honest employers.
            </p>
            <div className="flex gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  whileTap={{ scale: 0.95 }}
                  className="glass-card w-11 h-11 flex items-center justify-center group hover:border-primary-500/25 transition-all duration-300"
                  style={{ borderRadius: '14px' }}
                >
                  <Icon className="w-5 h-5 text-gray-500 group-hover:text-primary-400 transition-colors" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Product</h3>
            <ul className="space-y-3">
              {['Features', 'How It Works', 'Pricing', 'FAQ'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-500 hover:text-primary-400 transition-colors flex items-center gap-1 group text-sm">
                    {item}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Company</h3>
            <ul className="space-y-3">
              {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-500 hover:text-primary-400 transition-colors flex items-center gap-1 group text-sm">
                    {item}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-600 flex items-center gap-1">
            © 2026 Skill Ledger. Made with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs">
            <a href="#" className="text-gray-600 hover:text-primary-400 transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-600 hover:text-primary-400 transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-600 hover:text-primary-400 transition-colors">Cookie Policy</a>
            <motion.button
              onClick={scrollToTop}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 glass-card flex items-center justify-center hover:border-primary-500/30 transition-all"
              style={{ borderRadius: '10px' }}
              title="Back to top"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
