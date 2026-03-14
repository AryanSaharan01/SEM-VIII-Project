import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Loader } from 'lucide-react'
import { loginWithEmail } from '../../services/api'
import OTPVerification from './OTPVerification'

const LoginModal = ({ isOpen, onClose, setIsAuthenticated }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
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
        setShowOTP(true)
      } else {
        setError(result.message || 'Failed to send OTP')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOTPSuccess = (userData) => {
    // Store user data and token in localStorage
    localStorage.setItem('dtcs_token', 'mock-jwt-token-' + Date.now())
    localStorage.setItem('dtcs_user', JSON.stringify(userData))
    
    // Set authentication state
    if (setIsAuthenticated) {
      setIsAuthenticated(true)
    }
    
    onClose()
  }

  const handleBack = () => {
    setShowOTP(false)
    setEmail('')
    setError('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
          />
          
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full relative shadow-2xl border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {!showOTP ? (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-primary-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      Welcome Back
                    </h2>
                    <p className="text-gray-600">
                      Enter your email to receive a login code
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
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
                          <span>Sending Code...</span>
                        </>
                      ) : (
                        <span>Continue with Email</span>
                      )}
                    </button>
                  </form>

                  <div className="mt-6 text-center text-sm text-gray-500">
                    <p className="font-semibold text-gray-700 mb-2">Test Credentials:</p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1">
                      <p><strong>test@skillledger.com</strong> (any OTP works)</p>
                      <p><strong>demo@skillledger.com</strong> (OTP: 123456)</p>
                    </div>
                  </div>
                </>
              ) : (
                <OTPVerification 
                  email={email} 
                  onSuccess={handleOTPSuccess}
                  onBack={handleBack}
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
