import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, User, Loader, ArrowRight } from 'lucide-react'
import { loginWithEmail } from '../../services/api'
import OTPVerification from './OTPVerification'

const LoginModal = ({ isOpen, onClose, setIsAuthenticated }) => {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  // step: 'email' | 'name' | 'otp'
  const [step, setStep] = useState('email')
  const [isNewUser, setIsNewUser] = useState(false)
  const [error, setError] = useState('')

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      const result = await loginWithEmail(email)
      if (result.success) {
        setIsNewUser(result.isNewUser)
        if (result.isNewUser) {
          // New user: collect their name before sending OTP
          setStep('name')
        } else {
          // Existing user: go straight to OTP
          setStep('otp')
        }
      } else {
        setError(result.message || 'Failed to send OTP')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleNameSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please enter your name')
      return
    }

    // Name collected — now show OTP step (OTP was already triggered on email submit)
    setStep('otp')
  }

  const handleOTPSuccess = (userData) => {
    // JWT token is already saved to localStorage by verifyOTP (for real users)
    // For demo accounts, set a placeholder so auth state is consistent
    if (!localStorage.getItem('dtcs_token')) {
      localStorage.setItem('dtcs_token', 'demo-token-' + Date.now())
    }
    localStorage.setItem('dtcs_user', JSON.stringify(userData))
    if (setIsAuthenticated) setIsAuthenticated(true)
    onClose()
  }

  const handleReset = () => {
    setStep('email')
    setEmail('')
    setName('')
    setIsNewUser(false)
    setError('')
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card p-8 max-w-md w-full relative glass-glow"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* ── Step 1: Email ── */}
              {step === 'email' && (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-500/10 border border-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-primary-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Welcome</h2>
                    <p className="text-gray-400">Enter your email to get started</p>
                  </div>

                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-500"
                        autoFocus
                      />
                    </div>

                    {error && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full btn-primary flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          <span>Checking...</span>
                        </>
                      ) : (
                        <>
                          <span>Continue</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-6 text-center text-sm text-gray-500">
                    <p className="font-semibold text-gray-300 mb-2">Try a Demo Account:</p>
                    <div className="glass rounded-xl p-3 space-y-1 text-gray-400 text-xs">
                      <p><strong className="text-gray-300">demo@skillledger.com</strong> — existing user (OTP: 123456)</p>
                      <p><strong className="text-gray-300">test@skillledger.com</strong> — existing user (any OTP)</p>
                      <p className="text-gray-600 text-xs mt-2">Any other email → real signup via email OTP</p>
                    </div>
                  </div>
                </>
              )}

              {/* ── Step 2: Name (new users only) ── */}
              {step === 'name' && (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-violet-500/10 border border-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-violet-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                    <p className="text-gray-400">
                      Signing up as <strong className="text-white">{email}</strong>
                    </p>
                  </div>

                  <form onSubmit={handleNameSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex Johnson"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-500"
                        autoFocus
                      />
                    </div>

                    {error && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full btn-primary flex items-center justify-center space-x-2"
                    >
                      <span>Continue to Verification</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="w-full text-gray-500 hover:text-white text-sm transition-colors"
                    >
                      ← Use a different email
                    </button>
                  </form>
                </>
              )}

              {/* ── Step 3: OTP ── */}
              {step === 'otp' && (
                <OTPVerification
                  email={email}
                  name={name}
                  isNewUser={isNewUser}
                  onSuccess={handleOTPSuccess}
                  onBack={handleReset}
                />
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export default LoginModal
