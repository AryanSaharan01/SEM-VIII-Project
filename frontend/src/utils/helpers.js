import CryptoJS from 'crypto-js'

export const computeContentHash = (notes, artifactHashes, durationSec, topic) => {
  const payload = `${notes || ''}||${artifactHashes.join(',')}||${durationSec}||${topic || ''}`
  return CryptoJS.SHA256(payload).toString()
}

export const computeEntryHash = (prevHash, serverTs, contentHash, userId) => {
  const payload = `${prevHash || ''}||${serverTs}||${contentHash}||${userId}`
  return CryptoJS.SHA256(payload).toString()
}

export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export const formatDate = (date) => {
  if (!date) return 'N/A'
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'Invalid Date'
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export const formatDateTime = (date) => {
  if (!date) return 'N/A'
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'Invalid Date'
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const getScoreLabel = (score) => {
  if (score >= 75) return { label: 'Established', color: 'text-green-600', bg: 'bg-green-50' }
  if (score >= 50) return { label: 'Evolving', color: 'text-blue-600', bg: 'bg-blue-50' }
  return { label: 'Tentative', color: 'text-orange-600', bg: 'bg-orange-50' }
}

export const getPhaseColor = (phase) => {
  const colors = {
    'Exposure': 'bg-purple-500',
    'Confusion': 'bg-orange-500',
    'Learning': 'bg-yellow-500',
    'Integration': 'bg-blue-500',
    'Proficiency': 'bg-green-500'
  }
  return colors[phase] || 'bg-gray-500'
}
