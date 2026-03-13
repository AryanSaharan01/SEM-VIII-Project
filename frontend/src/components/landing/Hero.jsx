import React from 'react'
import { motion } from 'framer-motion'
import { Lock, TrendingUp, Clock, Shield } from 'lucide-react'

const Hero = ({ onGetStarted }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-neutral-50">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-neutral-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 container-custom px-6 py-6 flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold gradient-text">Skill Ledger</span>
        </motion.div>
        
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onGetStarted}
          className="btn btn-primary"
        >
          Get Started
        </motion.button>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 container-custom section-padding pt-16 pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Prove <span className="gradient-text">How You Learned</span>, Not Just What You Know
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Skill Ledger's Digital Time Capsule for Skills (DTCS) captures your learning journey in a time-ordered, tamper-proof capsule. 
              Show employers genuine effort, consistency, and progression—not just certificates.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button onClick={onGetStarted} className="btn btn-primary text-lg">
                Start Your Journey
              </button>
              <a href="#how-it-works" className="btn btn-outline text-lg">
                See How It Works
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold text-primary-500">100%</div>
                <div className="text-sm text-gray-600">Immutable</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-500">0</div>
                <div className="text-sm text-gray-600">Backdating</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-500">∞</div>
                <div className="text-sm text-gray-600">Credibility</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Main Card */}
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-neutral-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Learning Session</h3>
                  <p className="text-sm text-gray-500">Java - Exception Handling</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary-500" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-600">Time Invested</div>
                    <div className="text-lg font-semibold">45 minutes</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-primary-500" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-600">Difficulty</div>
                    <div className="text-lg font-semibold">Medium</div>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-50 rounded-lg p-4 font-mono text-xs text-gray-700 mb-4">
                Learned about checked vs unchecked exceptions. 
                Custom exceptions are powerful for domain-specific error handling...
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-gray-600">Locked & Hashed</span>
                </div>
                <div className="text-xs text-gray-500">2026-01-31 • 12:30 PM</div>
              </div>
            </div>

            {/* Floating Cards */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-6 -right-6 bg-primary-500 text-white rounded-xl p-4 shadow-lg w-40"
            >
              <div className="text-2xl font-bold">87%</div>
              <div className="text-xs opacity-90">Consistency Score</div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-4 -left-6 bg-white rounded-xl p-4 shadow-lg border border-neutral-200"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs font-semibold">24 Sessions</span>
              </div>
              <div className="text-xs text-gray-500">42 hours logged</div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="relative">
        <svg className="w-full h-16" viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 50C240 100 480 0 720 50C960 100 1200 0 1440 50V100H0V50Z" fill="white"/>
        </svg>
      </div>
    </section>
  )
}

export default Hero
