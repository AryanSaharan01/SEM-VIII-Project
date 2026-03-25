import React, { useState, useEffect, lazy, Suspense } from 'react'
import Hero from '../components/landing/Hero'
import LoginModal from '../components/auth/LoginModal'
import { useMousePosition } from '../utils/hooks'

// Lazy load below-the-fold sections
const Features = lazy(() => import('../components/landing/Features.jsx'))
const HowItWorks = lazy(() => import('../components/landing/HowItWorks.jsx'))
const WhyDTCS = lazy(() => import('../components/landing/WhyDTCS.jsx'))
const Testimonials = lazy(() => import('../components/landing/Testimonials.jsx'))
const Footer = lazy(() => import('../components/landing/Footer.jsx'))

const SectionLoader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500/20 border-t-primary-500" />
  </div>
)

const Landing = ({ setIsAuthenticated }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const mousePos = useMousePosition(50) // throttled to 50ms

  return (
    <div className="min-h-screen animated-gradient-bg noise-bg relative">
      {/* Mouse-following glow — uses throttled position */}
      <div 
        className="fixed pointer-events-none z-0 w-[600px] h-[600px] rounded-full"
        style={{
          left: mousePos.x - 300,
          top: mousePos.y - 300,
          background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, rgba(168,85,247,0.02) 40%, transparent 70%)',
          transition: 'left 0.15s linear, top 0.15s linear',
        }}
      />

      {/* Floating aurora blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-primary-500/5 aurora-blob" />
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-primary-400/5 aurora-blob" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-600/3 aurora-blob" style={{ animationDelay: '-5s' }} />
      </div>

      {/* Grid overlay */}
      <div className="fixed inset-0 grid-bg pointer-events-none z-0" />

      <div className="relative z-10">
        <Hero onGetStarted={() => setIsLoginModalOpen(true)} />
        <Suspense fallback={<SectionLoader />}>
          <Features />
          <HowItWorks />
          <WhyDTCS />
          <Testimonials />
          <Footer />
        </Suspense>
      </div>
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        setIsAuthenticated={setIsAuthenticated}
      />
    </div>
  )
}

export default Landing
