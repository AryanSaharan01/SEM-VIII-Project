import React, { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Lock, TrendingUp, Clock, Shield, Sparkles, ArrowRight, Zap, Users, BookOpen } from 'lucide-react'

// ─── Interactive particle canvas (optimized) ─────────────────────────────────
const ParticleCanvas = () => {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationId
    let particles = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    class Particle {
      constructor() {
        this.reset()
      }
      reset() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 2.5 + 0.5
        this.speedX = (Math.random() - 0.5) * 0.4
        this.speedY = (Math.random() - 0.5) * 0.4
        this.opacity = Math.random() * 0.4 + 0.1
        this.pulseSpeed = Math.random() * 0.02 + 0.005
        this.pulseOffset = Math.random() * Math.PI * 2
      }
      update(time) {
        this.x += this.speedX
        this.y += this.speedY
        // Mouse interaction with smooth repulsion
        const dx = mouseRef.current.x - this.x
        const dy = mouseRef.current.y - this.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 180) {
          const force = (180 - dist) / 180
          this.x -= dx * force * 0.008
          this.y -= dy * force * 0.008
        }
        // Pulse opacity
        this.currentOpacity = this.opacity + Math.sin(time * this.pulseSpeed + this.pulseOffset) * 0.1
        if (this.x < -10 || this.x > canvas.width + 10) this.speedX *= -1
        if (this.y < -10 || this.y > canvas.height + 10) this.speedY *= -1
      }
      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(192, 132, 252, ${this.currentOpacity || this.opacity})`
        ctx.fill()
      }
    }

    const particleCount = Math.min(100, Math.floor((canvas.width * canvas.height) / 15000))
    for (let i = 0; i < particleCount; i++) particles.push(new Particle())

    const connectParticles = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = dx * dx + dy * dy
          if (dist < 14400) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(168, 85, 247, ${0.1 * (1 - Math.sqrt(dist) / 120)})`
            ctx.lineWidth = 0.5
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
    }

    let time = 0
    const animate = () => {
      time++
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => { p.update(time); p.draw() })
      connectParticles()
      animationId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 z-0" />
}

// ─── Count-up animation component ────────────────────────────────────────────
const CountUp = ({ end, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated.current) {
        hasAnimated.current = true
        const startTime = performance.now()
        const tick = (now) => {
          const progress = Math.min((now - startTime) / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setCount(Math.floor(eased * end))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration])

  return <span ref={ref}>{count}{suffix}</span>
}



const Hero = ({ onGetStarted }) => {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], [0, 250])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])

  const statsData = [
    { value: 100, suffix: '%', label: 'Immutable', icon: Shield, color: 'text-emerald-400' },
    { value: 0, suffix: '', label: 'Backdating', icon: Lock, color: 'text-red-400', displayValue: '0' },
    { value: 10, suffix: 'K+', label: 'Users Trust Us', icon: Users, color: 'text-amber-400' },
  ]

  return (
    <section ref={containerRef} className="relative min-h-screen overflow-hidden">
      <ParticleCanvas />

      {/* Radial gradient overlays */}
      <div className="absolute inset-0 z-[1]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-gradient-radial from-primary-500/8 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-gradient-radial from-primary-600/6 via-transparent to-transparent" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-gradient-radial from-violet-600/5 via-transparent to-transparent" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 container-custom px-6 py-6 flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <div className="w-11 h-11 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -inset-1.5 bg-primary-500/15 rounded-2xl blur-lg -z-10" />
          </div>
          <span className="text-2xl font-bold text-shimmer tracking-tight">Skill Ledger</span>
        </motion.div>
        
        <motion.button
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onGetStarted}
          className="btn btn-primary group"
        >
          Get Started 
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </motion.button>
      </nav>

      {/* Hero Content */}
      <motion.div style={{ y, opacity, scale }} className="relative z-10 container-custom px-6 pt-8 pb-8">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass glass-glow mb-5 group cursor-default"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-400" />
              </span>
              <span className="text-sm font-medium text-primary-300">Digital Time Capsule for Skills</span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-4 tracking-tight">
              <span className="text-white">Prove Your Real Effort,</span>
              <br />
              <span className="gradient-text">Not Just What You Know</span>
            </h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-base text-gray-400 mb-7 leading-relaxed max-w-lg"
            >
              Capture your learning journey in a time-ordered, tamper-proof capsule. 
              Show employers genuine effort, consistency, and progression—not just certificates.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 mb-8"
            >
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: '0 16px 50px rgba(32, 128, 145, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                onClick={onGetStarted} 
                className="btn btn-primary text-lg group"
              >
                <Sparkles className="w-5 h-5" />
                Start Your Journey
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1.5" />
              </motion.button>
              <motion.a 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="#how-it-works" 
                className="btn btn-outline text-lg"
              >
                See How It Works
              </motion.a>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {statsData.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75 + i * 0.1, duration: 0.5 }}
                  className="glass-card glass-glow p-3 text-center shine-effect group"
                >
                  <stat.icon className={`w-4 h-4 ${stat.color} mx-auto mb-1.5`} />
                  <div className="text-xl font-bold text-white counter-glow">
                    {stat.displayValue !== undefined ? stat.displayValue : <CountUp end={stat.value} suffix={stat.suffix} />}
                  </div>
                  <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-0.5">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Interactive Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, rotateY: -10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            {/* Main Card */}
            <div className="relative glass-card glass-glow p-8 shine-effect">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary-400/50 to-transparent" />
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Learning Session</h3>
                  <p className="text-sm text-gray-400">Java — Exception Handling</p>
                </div>
                <motion.div 
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="w-12 h-12 bg-emerald-500/15 rounded-2xl flex items-center justify-center border border-emerald-500/25 shadow-lg shadow-emerald-500/10"
                >
                  <Shield className="w-6 h-6 text-emerald-400" />
                </motion.div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <Clock className="w-5 h-5 text-primary-400" />
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Time Invested</div>
                    <div className="text-lg font-semibold text-white">45 minutes</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <TrendingUp className="w-5 h-5 text-primary-400" />
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Difficulty</div>
                    <div className="text-lg font-semibold text-white">Medium</div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl p-4 font-mono text-xs text-primary-300/80 bg-black/30 border border-white/5 mb-4">
                <span className="text-gray-500">// </span>
                Learned about checked vs unchecked exceptions. 
                Custom exceptions are powerful for domain-specific error handling...
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <div className="glow-dot" />
                  <span className="text-xs text-gray-400">Locked & Hashed</span>
                </div>
                <div className="text-xs text-gray-500 font-mono">2026-01-31 • 12:30 PM</div>
              </div>
            </div>

            {/* Floating Card - Score */}
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 glass-card glass-glow p-4 w-44 shine-effect"
            >
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Score</span>
              </div>
              <div className="text-3xl font-bold text-white counter-glow">87%</div>
              <div className="text-xs text-primary-400">Consistency Score</div>
              <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '87%' }}
                  transition={{ delay: 1.2, duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-300 rounded-full" 
                />
              </div>
            </motion.div>

            {/* Floating Card - Sessions */}
            <motion.div
              animate={{ y: [0, 14, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 1.2, ease: "easeInOut" }}
              className="absolute -bottom-4 -left-6 glass-card glass-glow p-4 shine-effect"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50" />
                <span className="text-sm font-semibold text-white">24 Sessions</span>
              </div>
              <div className="text-xs text-gray-400">42 hours logged</div>
            </motion.div>

            {/* Orbiting dot */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-1/2 w-[380px] h-[380px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 glow-dot" />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-gray-500 uppercase tracking-widest">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-gray-600/50 flex justify-center pt-2"
        >
          <motion.div className="w-1.5 h-1.5 rounded-full bg-primary-400" />
        </motion.div>
      </motion.div>
    </section>
  )
}

export default Hero
