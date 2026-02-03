import React, { useState, useRef, useEffect } from 'react'
import { ArrowLeft, RefreshCw } from 'lucide-react'

const OTPVerification = ({ email, onVerify, onResend, onBack }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(30)
  const inputRefs = useRef([])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleChange = (index, value) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus()
    }

    // Auto-submit when all fields are filled
    if (index === 5 && value) {
      handleSubmit(newOtp.join(''))
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus()
    }
  }

  const handleSubmit = async (otpValue = otp.join('')) => {
    setError('')
    setIsLoading(true)

    try {
      await onVerify(otpValue)
    } catch (err) {
      setError(err.message)
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0].focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setResendTimer(30)
    await onResend()
  }

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to email
      </button>

      <div className="flex gap-3 justify-center">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
            autoFocus={index === 0}
          />
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      <button
        onClick={() => handleSubmit()}
        disabled={isLoading || otp.some(d => !d)}
        className="w-full btn btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Verifying...
          </span>
        ) : (
          'Verify & Continue'
        )}
      </button>

      <div className="text-center">
        {resendTimer > 0 ? (
          <p className="text-sm text-gray-500">
            Resend OTP in {resendTimer}s
          </p>
        ) : (
          <button
            onClick={handleResend}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Resend OTP
          </button>
        )}
      </div>
    </div>
  )
}

export default OTPVerification
