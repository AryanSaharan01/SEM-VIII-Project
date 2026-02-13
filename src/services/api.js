import { computeContentHash, computeEntryHash } from '../utils/helpers'

// Seed Data
const SEED_USER = {
  id: 1,
  email: 'demo@skillledger.com',
  displayName: 'Demo User',
  createdAt: '2025-11-01T00:00:00Z'
}

const SEED_SKILLS = [
  {
    id: 1,
    userId: 1,
    name: 'React Development',
    category: 'coding',
    createdAt: '2025-11-05T00:00:00Z',
    score: 78,
    consistencyScore: 87,
    totalSessions: 24,
    totalHours: 42
  },
  {
    id: 2,
    userId: 1,
    name: 'Python Data Science',
    category: 'coding',
    createdAt: '2025-11-10T00:00:00Z',
    score: 65,
    consistencyScore: 72,
    totalSessions: 18,
    totalHours: 31
  },
  {
    id: 3,
    userId: 1,
    name: 'Technical Writing',
    category: 'writing',
    createdAt: '2025-11-15T00:00:00Z',
    score: 82,
    consistencyScore: 91,
    totalSessions: 16,
    totalHours: 28
  }
]

const generateSessions = () => {
  const sessions = []
  let id = 1
  
  // React sessions
  const reactTopics = [
    'Component Basics', 'Hooks Introduction', 'useState & useEffect',
    'Custom Hooks', 'Context API', 'useReducer Pattern',
    'React Router', 'Form Handling', 'Performance Optimization',
    'Error Boundaries', 'Code Splitting', 'Testing with Jest',
    'TypeScript Integration', 'Advanced Patterns', 'Server Components',
    'Next.js Basics', 'State Management', 'Component Design',
    'Accessibility', 'Animation with Framer', 'API Integration',
    'Authentication Flow', 'Real-time Updates', 'Deployment'
  ]
  
  reactTopics.forEach((topic, index) => {
    const date = new Date('2025-11-05')
    date.setDate(date.getDate() + index * 3)
    sessions.push({
      id: id++,
      skillId: 1,
      userId: 1,
      topic,
      notes: `Worked on ${topic.toLowerCase()}. ${index < 10 ? 'Found it challenging initially.' : 'Making good progress.'} ${index > 15 ? 'Feeling confident now!' : ''}`,
      durationSeconds: 1800 + Math.floor(Math.random() * 3600),
      clientTs: date.toISOString(),
      serverTs: date.toISOString(),
      contentHash: '',
      entryHash: '',
      prevHash: null,
      deleted: false,
      phase: index < 5 ? 'Exposure' : index < 10 ? 'Confusion' : index < 15 ? 'Learning' : index < 20 ? 'Integration' : 'Proficiency'
    })
  })
  
  // Python sessions
  const pythonTopics = [
    'NumPy Basics', 'Pandas DataFrames', 'Data Cleaning',
    'Matplotlib Plotting', 'Seaborn Visualization', 'Statistical Analysis',
    'Linear Regression', 'Decision Trees', 'Random Forests',
    'Neural Networks', 'Model Evaluation', 'Feature Engineering',
    'Cross Validation', 'Hyperparameter Tuning', 'Ensemble Methods',
    'Deep Learning', 'NLP Basics', 'Time Series'
  ]
  
  pythonTopics.forEach((topic, index) => {
    const date = new Date('2025-11-10')
    date.setDate(date.getDate() + index * 4)
    sessions.push({
      id: id++,
      skillId: 2,
      userId: 1,
      topic,
      notes: `Studied ${topic.toLowerCase()}. Practiced with real datasets. ${index > 10 ? 'Understanding patterns better.' : 'Still learning the fundamentals.'}`,
      durationSeconds: 2400 + Math.floor(Math.random() * 2400),
      clientTs: date.toISOString(),
      serverTs: date.toISOString(),
      contentHash: '',
      entryHash: '',
      prevHash: null,
      deleted: false,
      phase: index < 4 ? 'Exposure' : index < 8 ? 'Confusion' : index < 12 ? 'Learning' : index < 16 ? 'Integration' : 'Proficiency'
    })
  })
  
  // Writing sessions
  const writingTopics = [
    'Research Methodology', 'Literature Review', 'Thesis Statement',
    'Argument Structure', 'Citation Practices', 'Academic Tone',
    'Critical Analysis', 'Peer Review', 'Revision Strategies',
    'Abstract Writing', 'Introduction Drafting', 'Conclusion Techniques',
    'Paragraph Coherence', 'Technical Documentation', 'Style Guides',
    'Publishing Process'
  ]
  
  writingTopics.forEach((topic, index) => {
    const date = new Date('2025-11-15')
    date.setDate(date.getDate() + index * 5)
    sessions.push({
      id: id++,
      skillId: 3,
      userId: 1,
      topic,
      notes: `Focused on ${topic.toLowerCase()}. Revised previous work. ${index > 8 ? 'Writing is improving significantly.' : 'Building foundational skills.'}`,
      durationSeconds: 3000 + Math.floor(Math.random() * 2000),
      clientTs: date.toISOString(),
      serverTs: date.toISOString(),
      contentHash: '',
      entryHash: '',
      prevHash: null,
      deleted: false,
      phase: index < 3 ? 'Exposure' : index < 6 ? 'Confusion' : index < 10 ? 'Learning' : index < 14 ? 'Integration' : 'Proficiency'
    })
  })
  
  // Compute hashes
  sessions.forEach((session, index) => {
    session.contentHash = computeContentHash(
      session.notes,
      [],
      session.durationSeconds,
      session.topic
    )
    session.prevHash = index > 0 && sessions[index - 1].skillId === session.skillId 
      ? sessions[index - 1].entryHash 
      : null
    session.entryHash = computeEntryHash(
      session.prevHash,
      session.serverTs,
      session.contentHash,
      session.userId
    )
  })
  
  return sessions
}

const SEED_SESSIONS = generateSessions()

// Test credentials - for demo purposes (SMTP integration to be added later)
const TEST_EMAIL = 'test@skillledger.com'

// Mock API functions
export const loginWithEmail = async (email) => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  // Accept any email, but log it
  console.log(`Login attempt with email: ${email}`)
  return { success: true, message: 'OTP sent to your email' }
}

export const verifyOTP = async (email, otp) => {
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // For test email, accept any OTP
  if (email === TEST_EMAIL) {
    console.log(`Test login successful with email: ${email}, OTP: ${otp}`)
    return { 
      success: true, 
      user: { 
        ...SEED_USER, 
        email: TEST_EMAIL,
        displayName: 'Test User'
      } 
    }
  }
  
  // For demo email, use specific OTP
  if (email === SEED_USER.email && otp === '123456') {
    return { success: true, user: SEED_USER }
  }
  
  return { success: false, message: 'Invalid OTP. For test, use: test@skillledger.com with any OTP' }
}

export const getSkills = async () => {
  await new Promise(resolve => setTimeout(resolve, 300))
  return SEED_SKILLS
}

export const addSkill = async (skillData) => {
  await new Promise(resolve => setTimeout(resolve, 500))
  const newSkill = {
    id: SEED_SKILLS.length + 1 + Math.floor(Math.random() * 1000),
    userId: 1,
    name: skillData.name,
    category: skillData.category,
    linkedRepo: skillData.linkedRepo || null,
    createdAt: new Date().toISOString(),
    score: 0,
    consistencyScore: 0,
    totalSessions: 0,
    totalHours: 0
  }
  SEED_SKILLS.push(newSkill)
  return newSkill
}

export const getSessions = async (skillId) => {
  await new Promise(resolve => setTimeout(resolve, 300))
  return SEED_SESSIONS.filter(s => s.skillId === skillId)
}

export const createSession = async (sessionData) => {
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const prevSessions = SEED_SESSIONS.filter(s => s.skillId === sessionData.skillId)
  const prevHash = prevSessions.length > 0 
    ? prevSessions[prevSessions.length - 1].entryHash 
    : null
  
  const serverTs = new Date().toISOString()
  const contentHash = computeContentHash(
    sessionData.notes,
    [],
    sessionData.durationSeconds,
    sessionData.topic
  )
  const entryHash = computeEntryHash(prevHash, serverTs, contentHash, 1)
  
  const newSession = {
    id: SEED_SESSIONS.length + 1 + Math.floor(Math.random() * 10000),
    ...sessionData,
    userId: 1,
    clientTs: sessionData.clientTs || new Date().toISOString(),
    serverTs,
    contentHash,
    prevHash,
    entryHash,
    deleted: false,
    phase: 'Learning',
    difficulty: sessionData.difficulty || 'medium'
  }
  
  SEED_SESSIONS.push(newSession)
  return newSession
}

export const getScoreBreakdown = async (skillId) => {
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const skill = SEED_SKILLS.find(s => s.id === skillId)
  if (!skill) return null
  
  if (skill.category === 'coding') {
    return {
      consistency: { score: 85, weight: 30, description: '24 sessions in last 30 days' },
      depth: { score: 72, weight: 25, description: 'Avg 150 LOC per session' },
      progression: { score: 78, weight: 20, description: 'Steady improvement trend' },
      externalProof: { score: 80, weight: 15, description: '12 GitHub commits linked' },
      peerReview: { score: 65, weight: 10, description: '5 code reviews received' }
    }
  } else {
    return {
      revisionCount: { score: 88, weight: 30, description: '16 draft versions' },
      depth: { score: 82, weight: 25, description: 'Avg 1200 words per session' },
      consistency: { score: 91, weight: 20, description: '16 sessions in last 30 days' },
      citations: { score: 75, weight: 15, description: '24 sources referenced' },
      externalFeedback: { score: 70, weight: 10, description: '3 peer reviews' }
    }
  }
}

export const getActivityHeatmap = async () => {
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const weeks = []
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 90)
  
  for (let i = 0; i < 13; i++) {
    const weekData = []
    for (let j = 0; j < 7; j++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i * 7 + j)
      
      const sessionsOnDay = SEED_SESSIONS.filter(s => {
        const sessionDate = new Date(s.clientTs)
        return sessionDate.toDateString() === date.toDateString()
      })
      
      weekData.push({
        date: date.toISOString().split('T')[0],
        count: sessionsOnDay.length,
        sessions: sessionsOnDay
      })
    }
    weeks.push(weekData)
  }
  
  return weeks
}

export const generateCapsuleToken = async (skillId) => {
  await new Promise(resolve => setTimeout(resolve, 500))
  const token = Math.random().toString(36).substring(2, 15)
  return {
    token,
    url: `${window.location.origin}/capsule/${skillId}?token=${token}`,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  }
}
