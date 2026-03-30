import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader, Shield, UserCheck, LogIn } from 'lucide-react'
import { verifyOTP } from '../../services/api'

const OTPVerification = ({ email, name, isNewUser, onSuccess, onBack }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRefs = useRef([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerify(newOtp.join(''))
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async (otpCode) => {
    setLoading(true)
    setError('')

    try {
      // Pass name so the backend can store it for new users
      const result = await verifyOTP(email, otpCode, name)
      if (result.success) {
        onSuccess(result.user)
      } else {
        setError(result.message || 'Invalid OTP')
        setOtp(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      }
    } catch (err) {
      setError('Verification failed. Please try again.')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center text-gray-500 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      <div className="text-center mb-8">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isNewUser ? 'bg-violet-500/10 border border-violet-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'}`}>
          {isNewUser
            ? <UserCheck className="w-8 h-8 text-violet-400" />
            : <Shield className="w-8 h-8 text-emerald-400" />
          }
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">
          {isNewUser ? 'Verify Your Email' : 'Enter Verification Code'}
        </h2>
        <p className="text-gray-400">
          {isNewUser
            ? <>We sent a verification code to <strong className="text-white">{email}</strong> to complete your signup.</>
            : <>We sent a 6-digit code to <strong className="text-white">{email}</strong></>
          }
        </p>
        {isNewUser && name && (
          <p className="mt-2 text-sm text-primary-400 font-medium">Welcome, {name}! 🎉</p>
        )}
      </div>

      <div className="flex justify-center space-x-3 mb-6">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={el => inputRefs.current[index] = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-14 text-center text-2xl font-bold bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-white"
            disabled={loading}
          />
        ))}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-4 text-center"
        >
          {error}
        </motion.div>
      )}

      {loading && (
        <div className="flex items-center justify-center text-primary-400">
          <Loader className="w-5 h-5 animate-spin mr-2" />
          <span>{isNewUser ? 'Creating account...' : 'Verifying...'}</span>
        </div>
      )}

      <div className="mt-6 text-center text-sm">
        <div className="glass rounded-xl p-3">
          {email === 'test@skillledger.com' ? (
            <p className="text-primary-300 font-semibold">Test mode: <strong>Any 6-digit OTP will work</strong></p>
          ) : email === 'demo@skillledger.com' ? (
            <p className="text-primary-300 font-semibold">Demo account: Use OTP <strong>123456</strong></p>
          ) : (
            <p className="text-gray-400">
              📬 A verification code was sent to <strong className="text-white">{email}</strong>. Check your inbox (and spam folder).
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default OTPVerification
