import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, ArrowRight } from 'lucide-react'
import OTPVerification from './OTPVerification'
import axios from 'axios'

const LoginModal = ({ isOpen, onClose, setIsAuthenticated }) => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const [error, setError] = useState('')

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Call backend API to send OTP
      await axios.post('/api/auth/send-otp', { email })
      setShowOTP(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (otp) => {
    try {
      const response = await axios.post('/api/auth/verify-otp', { email, otp })
      localStorage.setItem('dtcs_token', response.data.token)
      setIsAuthenticated(true)
      onClose()
      window.location.href = '/dashboard'
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Invalid OTP')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {showOTP ? 'Verify OTP' : 'Welcome to Skill Ledger'}
              </h2>
              <p className="text-gray-600">
                {showOTP 
                  ? `Enter the code sent to ${email}`
                  : 'Sign in or create an account to start your learning journey'
                }
              </p>
            </div>

            {/* Content */}
            {!showOTP ? (
              <form onSubmit={handleSendOTP} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending OTP...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Send OTP
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </button>

                <p className="text-xs text-center text-gray-500">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </form>
            ) : (
              <OTPVerification
                email={email}
                onVerify={handleVerifyOTP}
                onResend={handleSendOTP}
                onBack={() => setShowOTP(false)}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LoginModal
