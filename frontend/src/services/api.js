import { computeContentHash, computeEntryHash } from '../utils/helpers'

// ─── Backend base URL ─────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// ─── Helper: make authenticated requests ─────────────────────────────────────
const authHeaders = () => {
  const token = localStorage.getItem('dtcs_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

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

// Test credentials - for demo purposes only (bypasses backend)
const TEST_EMAIL = 'test@skillledger.com'
const DEMO_EMAIL = 'demo@skillledger.com'

// ─── AUTH — calls real backend, falls back to demo accounts ──────────────────

export const loginWithEmail = async (email) => {
  // Demo accounts: handled locally, no backend call needed
  if (email === DEMO_EMAIL || email === TEST_EMAIL) {
    await new Promise(resolve => setTimeout(resolve, 600))
    return { success: true, message: 'OTP sent to your email', isNewUser: false }
  }

  // Real email: call the backend to send a real OTP
  try {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    if (!res.ok) return { success: false, message: data.message || 'Failed to send OTP' }
    return { success: true, message: data.message, isNewUser: data.data?.isNewUser ?? false }
  } catch (err) {
    console.error('send-otp error:', err)
    return { success: false, message: 'Could not reach the server. Is the backend running?' }
  }
}

export const verifyOTP = async (email, otp, name) => {
  // Demo account shortcuts (no backend call)
  if (email === TEST_EMAIL) {
    await new Promise(resolve => setTimeout(resolve, 600))
    return { success: true, isNewUser: false, user: { ...SEED_USER, email: TEST_EMAIL, displayName: 'Test User' } }
  }
  if (email === DEMO_EMAIL) {
    await new Promise(resolve => setTimeout(resolve, 600))
    if (otp === '123456') return { success: true, isNewUser: false, user: SEED_USER }
    return { success: false, message: 'Incorrect OTP. Demo account uses OTP: 123456' }
  }

  // Real email: verify with backend
  try {
    // Only include name if it's a non-empty string (new user signup)
    const payload = { email, otp }
    if (name && name.trim()) payload.name = name.trim()

    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) return { success: false, message: data.message || 'OTP verification failed' }
    // Store the real JWT token
    if (data.data?.token) localStorage.setItem('dtcs_token', data.data.token)
    return {
      success: true,
      isNewUser: data.data?.isNewUser ?? false,
      user: data.data?.user,
    }
  } catch (err) {
    console.error('verify-otp error:', err)
    return { success: false, message: 'Could not reach the server. Is the backend running?' }
  }
}

// ─── Helper: is this a demo/mock session? ────────────────────────────────────
const isDemoUser = () => {
  const user = JSON.parse(localStorage.getItem('dtcs_user') || '{}')
  return user.email === 'demo@skillledger.com' || user.email === 'test@skillledger.com'
}

export const deleteSkill = async (skillId) => {
  if (isDemoUser()) {
    await new Promise(resolve => setTimeout(resolve, 400))
    const idx = SEED_SKILLS.findIndex(s => s.id === skillId)
    if (idx !== -1) SEED_SKILLS.splice(idx, 1)
    return
  }
  try {
    const res = await fetch(`${API_BASE}/skills/${skillId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to delete skill')
  } catch (err) {
    console.error('deleteSkill error:', err)
    throw err
  }
}

export const getSkills = async () => {
  if (isDemoUser()) {
    await new Promise(resolve => setTimeout(resolve, 300))
    return SEED_SKILLS
  }
  try {
    const res = await fetch(`${API_BASE}/skills`, { headers: authHeaders() })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    // Backend returns { success, data: { skills: [...] } }
    const skills = Array.isArray(data.data?.skills) ? data.data.skills : []
    // Map snake_case to camelCase for consistency
    return skills.map(s => ({
      ...s,
      createdAt: s.created_at || s.createdAt,
      totalSessions: s.totalSessions ?? s.total_sessions ?? 0,
      totalHours: s.totalHours ?? s.total_hours ?? 0,
      consistencyScore: s.consistencyScore ?? s.consistency_score ?? 0,
      linkedRepoName: s.linked_repo_name || s.linkedRepoName,
      linkedRepoId: s.linked_repo_id || s.linkedRepoId,
    }))
  } catch (err) {
    console.error('getSkills error:', err)
    return []
  }
}

export const addSkill = async (skillData) => {
  if (isDemoUser()) {
    await new Promise(resolve => setTimeout(resolve, 500))
    const newSkill = {
      id: SEED_SKILLS.length + 1 + Math.floor(Math.random() * 1000),
      userId: 1,
      name: skillData.name,
      category: skillData.category,
      linkedRepo: skillData.linkedRepo || null,
      createdAt: new Date().toISOString(),
      score: 0, consistencyScore: 0, totalSessions: 0, totalHours: 0
    }
    SEED_SKILLS.push(newSkill)
    return newSkill
  }
  try {
    const res = await fetch(`${API_BASE}/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(skillData),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    // Backend returns { success, data: { skill: {...} } }
    return data.data?.skill || data.data
  } catch (err) {
    console.error('addSkill error:', err)
    throw err
  }
}

export const getSessions = async (skillId) => {
  if (isDemoUser()) {
    await new Promise(resolve => setTimeout(resolve, 300))
    return SEED_SESSIONS.filter(s => s.skillId === skillId)
  }
  try {
    const res = await fetch(`${API_BASE}/sessions?skillId=${skillId}`, { headers: authHeaders() })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    // Backend uses paginated() → { success, data: [...], pagination: {...} }
    const sessions = Array.isArray(data.data) ? data.data : []
    // Map snake_case to camelCase for consistency
    return sessions.map(s => ({
      ...s,
      skillId: s.skill_id || s.skillId,
      userId: s.user_id || s.userId,
      clientTs: s.client_ts || s.clientTs,
      durationSeconds: s.duration_seconds || s.durationSeconds,
      contentHash: s.content_hash || s.contentHash,
      entryHash: s.entry_hash || s.entryHash,
      prevHash: s.prev_hash || s.prevHash,
      proofOfWork: s.proof_of_work || s.proofOfWork,
    }))
  } catch (err) {
    console.error('getSessions error:', err)
    return []
  }
}

export const createSession = async (sessionData) => {
  if (isDemoUser()) {
    await new Promise(resolve => setTimeout(resolve, 500))
    const prevSessions = SEED_SESSIONS.filter(s => s.skillId === sessionData.skillId)
    const prevHash = prevSessions.length > 0 ? prevSessions[prevSessions.length - 1].entryHash : null
    const serverTs = new Date().toISOString()
    const contentHash = computeContentHash(sessionData.notes, [], sessionData.durationSeconds, sessionData.topic)
    const entryHash = computeEntryHash(prevHash, serverTs, contentHash, 1)
    const newSession = {
      id: SEED_SESSIONS.length + 1 + Math.floor(Math.random() * 10000),
      ...sessionData,
      userId: 1, clientTs: sessionData.clientTs || new Date().toISOString(),
      serverTs, contentHash, prevHash, entryHash, deleted: false,
      phase: 'Learning', difficulty: sessionData.difficulty || 'medium'
    }
    SEED_SESSIONS.push(newSession)
    return newSession
  }
  try {
    const res = await fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(sessionData),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    // Backend returns { success, data: { session: {...} } }
    return data.data?.session || data.data
  } catch (err) {
    console.error('createSession error:', err)
    throw err
  }
}

export const getScoreBreakdown = async (skillId) => {
  if (isDemoUser()) {
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
  
  // Real user: fetch from backend
  try {
    const res = await fetch(`${API_BASE}/analytics/score/${skillId}`, { headers: authHeaders() })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data.data?.breakdown || data.data
  } catch (err) {
    console.error('getScoreBreakdown error:', err)
    // Return a fallback structure so the UI doesn't break
    return {
      consistency: { score: 0, weight: 30, description: 'No data yet' },
      depth: { score: 0, weight: 25, description: 'No data yet' },
      progression: { score: 0, weight: 20, description: 'No data yet' },
      externalProof: { score: 0, weight: 15, description: 'No data yet' },
      engagement: { score: 0, weight: 10, description: 'No data yet' }
    }
  }
}

export const getActivityHeatmap = async (skillId) => {
  if (isDemoUser()) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Filter seed sessions by skillId if provided
    const relevantSessions = skillId
      ? SEED_SESSIONS.filter(s => s.skillId === skillId)
      : SEED_SESSIONS

    const weeks = []
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 90)
    
    for (let i = 0; i < 13; i++) {
      const weekData = []
      for (let j = 0; j < 7; j++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i * 7 + j)
        
        const sessionsOnDay = relevantSessions.filter(s => {
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
  
  // Real user: fetch from backend
  try {
    const url = new URL(`${API_BASE}/analytics/heatmap`)
    if (skillId) url.searchParams.set('skillId', skillId)
    const res = await fetch(url.toString(), { headers: authHeaders() })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data.data?.heatmap || []
  } catch (err) {
    console.error('getActivityHeatmap error:', err)
    return []
  }
}

// ─── GITHUB ──────────────────────────────────────────────────────────────────

export const getGitHubStatus = async () => {
  if (isDemoUser()) return { connected: false, connection: null }
  try {
    const res = await fetch(`${API_BASE}/github/status`, { headers: authHeaders() })
    const data = await res.json()
    if (!res.ok) return { connected: false, connection: null }
    return data.data
  } catch { return { connected: false, connection: null } }
}

export const getGitHubAuthUrl = () => {
  const token = localStorage.getItem('dtcs_token')
  return `${API_BASE}/auth/github?token=${encodeURIComponent(token || '')}`
}

export const getGitHubRepos = async () => {
  if (isDemoUser()) return []
  try {
    const res = await fetch(`${API_BASE}/github/repos`, { headers: authHeaders() })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data.data?.repos || []
  } catch (err) {
    console.error('getGitHubRepos error:', err)
    throw err
  }
}

export const getGitHubTree = async (owner, repo) => {
  if (isDemoUser()) return { tree: [], flatTree: [], branch: 'main' }
  try {
    const res = await fetch(`${API_BASE}/github/tree/${owner}/${repo}`, { headers: authHeaders() })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data.data
  } catch (err) {
    console.error('getGitHubTree error:', err)
    throw err
  }
}

// Lightweight helper — returns the default branch name for a repo
// Reuses the tree endpoint (which already fetches repo info to get the branch).
export const getGitHubDefaultBranch = async (owner, repo) => {
  try {
    const result = await getGitHubTree(owner, repo)
    return result.branch || 'main'
  } catch {
    return 'main'
  }
}

export const disconnectGitHub = async () => {
  if (isDemoUser()) return
  try {
    const res = await fetch(`${API_BASE}/github/disconnect`, {
      method: 'DELETE',
      headers: authHeaders()
    })
    if (!res.ok) throw new Error('Failed to disconnect')
  } catch (err) {
    console.error('disconnectGitHub error:', err)
    throw err
  }
}

export const getGitHubFile = async (owner, repo, path) => {
  if (isDemoUser()) return { content: '// Demo mode — real file content unavailable' }
  try {
    const res = await fetch(
      `${API_BASE}/github/file/${owner}/${repo}?path=${encodeURIComponent(path)}`,
      { headers: authHeaders() }
    )
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data.data
  } catch (err) {
    console.error('getGitHubFile error:', err)
    throw err
  }
}

export const saveSelectedRepos = async (selectedRepos) => {
  if (isDemoUser()) return { selectedRepos }
  try {
    const res = await fetch(`${API_BASE}/github/selected-repos`, {
      method: 'PATCH',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedRepos }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to save selected repos')
    return data.data
  } catch (err) {
    console.error('saveSelectedRepos error:', err)
    throw err
  }
}

export const generateCapsuleToken = async (skillId) => {
  if (isDemoUser()) {
    await new Promise(resolve => setTimeout(resolve, 500))
    const token = Math.random().toString(36).substring(2, 15)
    return {
      token,
      url: `${window.location.origin}/capsule/${token}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  }
  
  // Real user: call backend
  try {
    const res = await fetch(`${API_BASE}/capsule/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ skillId }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data.data
  } catch (err) {
    console.error('generateCapsuleToken error:', err)
    throw err
  }
}

// Fetch capsule data by token (public — no auth needed)
export const getCapsuleByToken = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/capsule/${token}`)
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Invalid or expired capsule link')
    return data.data?.capsule || data.data
  } catch (err) {
    console.error('getCapsuleByToken error:', err)
    throw err
  }
}

// Fetch capsule link history for a skill
export const getCapsuleHistory = async (skillId) => {
  if (isDemoUser()) {
    return { history: [] }
  }
  try {
    const res = await fetch(`${API_BASE}/capsule/history/${skillId}`, {
      headers: authHeaders(),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to fetch capsule history')
    return data.data
  } catch (err) {
    console.error('getCapsuleHistory error:', err)
    return { history: [] }
  }
}

// Generate LinkedIn certificate
export const generateCertificate = async (skillId) => {
  if (isDemoUser()) {
    await new Promise(resolve => setTimeout(resolve, 500))
    const certToken = Math.random().toString(36).substring(2, 15)
    return {
      certToken,
      url: `${window.location.origin}/certificate/${certToken}`,
      imageUrl: `${window.location.origin}/api/capsule/certificate/${certToken}/image`,
      issuedAt: new Date().toISOString(),
      linkedInShareUrl: `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=Demo%20Skill%20Certificate&organizationName=Skill%20Ledger`
    }
  }
  
  // Real user: call backend
  try {
    const res = await fetch(`${API_BASE}/capsule/certificate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ skillId }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data.data
  } catch (err) {
    console.error('generateCertificate error:', err)
    throw err
  }
}

// Get skill with linked repos
export const getSkillWithRepos = async (skillId) => {
  if (isDemoUser()) {
    await new Promise(resolve => setTimeout(resolve, 200))
    const skill = SEED_SKILLS.find(s => s.id === skillId)
    return skill ? { ...skill, linkedRepos: [] } : null
  }
  
  try {
    const res = await fetch(`${API_BASE}/skills/${skillId}`, { headers: authHeaders() })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data.data?.skill || data.data
  } catch (err) {
    console.error('getSkillWithRepos error:', err)
    throw err
  }
}

// Update skill linked repos
export const updateSkillRepos = async (skillId, linkedRepo) => {
  if (isDemoUser()) {
    await new Promise(resolve => setTimeout(resolve, 300))
    return { success: true }
  }
  
  try {
    const res = await fetch(`${API_BASE}/skills/${skillId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ linkedRepo }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data.data?.skill || data.data
  } catch (err) {
    console.error('updateSkillRepos error:', err)
    throw err
  }
}

// Check if repo has linked sessions (for safe removal)
export const checkRepoUsage = async (skillId, repoFullName) => {
  if (isDemoUser()) {
    await new Promise(resolve => setTimeout(resolve, 200))
    return { hasLinkedSessions: false }
  }
  
  try {
    const res = await fetch(`${API_BASE}/skills/${skillId}/repo-usage?repo=${encodeURIComponent(repoFullName)}`, { 
      headers: authHeaders() 
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data.data
  } catch (err) {
    console.error('checkRepoUsage error:', err)
    return { hasLinkedSessions: false }
  }
}
