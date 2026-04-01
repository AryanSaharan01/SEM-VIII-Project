// ─── Backend base URL ─────────────────────────────────────────────────────────
const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim()
const normalizedApiUrl = rawApiUrl.replace(/\/+$/, '')
const API_BASE = normalizedApiUrl
  ? (normalizedApiUrl.endsWith('/api') ? normalizedApiUrl : `${normalizedApiUrl}/api`)
  : 'http://localhost:5000/api'

// ─── Helper: make authenticated requests ─────────────────────────────────────
const authHeaders = () => {
  const token = localStorage.getItem('dtcs_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const loginWithEmail = async (email) => {
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
  try {
    const payload = { email, otp }
    if (name && name.trim()) payload.name = name.trim()

    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) return { success: false, message: data.message || 'OTP verification failed' }

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

export const deleteSkill = async (skillId) => {
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
  try {
    const res = await fetch(`${API_BASE}/skills`, { headers: authHeaders() })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    const skills = Array.isArray(data.data?.skills) ? data.data.skills : []
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
  try {
    const res = await fetch(`${API_BASE}/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(skillData),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data.data?.skill || data.data
  } catch (err) {
    console.error('addSkill error:', err)
    throw err
  }
}

export const getSessions = async (skillId) => {
  try {
    const res = await fetch(`${API_BASE}/sessions?skillId=${skillId}`, { headers: authHeaders() })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    const sessions = Array.isArray(data.data) ? data.data : []
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
  try {
    const res = await fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(sessionData),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data.data?.session || data.data
  } catch (err) {
    console.error('createSession error:', err)
    throw err
  }
}

export const uploadSessionProofFile = async (skillId, file) => {
  try {
    const formData = new FormData()
    formData.append('skillId', skillId)
    formData.append('file', file)

    const res = await fetch(`${API_BASE}/sessions/upload-proof`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData,
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to upload file')
    return data.data
  } catch (err) {
    console.error('uploadSessionProofFile error:', err)
    throw err
  }
}

export const getScoreBreakdown = async (skillId) => {
  try {
    const res = await fetch(`${API_BASE}/analytics/score/${skillId}`, { headers: authHeaders() })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data.data?.breakdown || data.data
  } catch (err) {
    console.error('getScoreBreakdown error:', err)
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

export const getGitHubStatus = async () => {
  try {
    const res = await fetch(`${API_BASE}/github/status`, { headers: authHeaders() })
    const data = await res.json()
    if (!res.ok) return { connected: false, connection: null }
    return data.data
  } catch {
    return { connected: false, connection: null }
  }
}

export const getGitHubAuthUrl = () => {
  const token = localStorage.getItem('dtcs_token')
  return `${API_BASE}/auth/github?token=${encodeURIComponent(token || '')}`
}

export const getGitHubRepos = async () => {
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

export const getGitHubDefaultBranch = async (owner, repo) => {
  try {
    const result = await getGitHubTree(owner, repo)
    return result.branch || 'main'
  } catch {
    return 'main'
  }
}

export const disconnectGitHub = async () => {
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

export const getCapsuleHistory = async (skillId) => {
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

export const generateCertificate = async (skillId) => {
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

export const getSkillWithRepos = async (skillId) => {
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

export const updateSkillRepos = async (skillId, linkedRepo) => {
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

export const checkRepoUsage = async (skillId, repoFullName) => {
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
