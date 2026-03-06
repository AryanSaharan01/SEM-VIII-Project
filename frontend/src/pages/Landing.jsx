import React, { useState } from 'react'
import Hero from '../components/landing/Hero'
import Features from '../components/landing/Features.jsx'
import HowItWorks from '../components/landing/HowItWorks.jsx'
import WhyDTCS from '../components/landing/WhyDTCS.jsx'
import Testimonials from '../components/landing/Testimonials.jsx'
import Footer from '../components/landing/Footer.jsx'
import LoginModal from '../components/auth/LoginModal'

const Landing = ({ setIsAuthenticated }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-neutral-50">
      <Hero onGetStarted={() => setIsLoginModalOpen(true)} />
      <Features />
      <HowItWorks />
      <WhyDTCS />
      <Testimonials />
      <Footer />
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        setIsAuthenticated={setIsAuthenticated}
      />
    </div>
  )
}

export default Landing
