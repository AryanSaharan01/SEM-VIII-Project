import { computeContentHash, computeEntryHash } from './hashing'

const generateSessionChain = (skillId, userId, count) => {
  const sessions = []
  let prevHash = null
  
  const topics = {
    coding: [
      'Variables and Data Types',
      'Control Flow',
      'Functions and Scope',
      'Array Methods',
      'Async Programming',
      'API Integration',
      'Error Handling',
      'Testing Fundamentals',
      'Database Queries',
      'Authentication'
    ],
    writing: [
      'Research Methodology',
      'Literature Review',
      'Thesis Development',
      'Citation Management',
      'Argument Structure',
      'Peer Review Process',
      'Revision Strategies',
      'Academic Style',
      'Data Presentation',
      'Conclusion Writing'
    ]
  }
  
  const notes = {
    coding: [
      'Learned about variable declarations and type coercion. Practiced with examples.',
      'Implemented if-else statements and switch cases. Debugged logic errors.',
      'Created helper functions and understood closure. Refactored old code.',
      'Practiced map, filter, reduce. Built data transformation pipeline.',
      'Studied promises and async/await. Converted callback code to async.',
      'Integrated third-party API. Handled rate limiting and errors.',
      'Implemented try-catch blocks. Created custom error classes.',
      'Wrote unit tests with Jest. Achieved 80% code coverage.',
      'Practiced SQL joins and subqueries. Optimized slow queries.',
      'Implemented JWT authentication. Added password hashing.'
    ],
    writing: [
      'Read 5 papers on research methods. Took detailed notes on qualitative vs quantitative.',
      'Compiled 15 sources. Created annotated bibliography with key findings.',
      'Drafted initial thesis statement. Revised based on advisor feedback.',
      'Organized references in Zotero. Practiced APA citation format.',
      'Outlined main arguments with supporting evidence. Identified gaps.',
      'Received peer comments. Made revisions to introduction and methods.',
      'Revised entire draft for clarity. Removed redundant sections.',
      'Improved paragraph transitions. Eliminated passive voice.',
      'Created tables and figures. Added captions and interpretations.',
      'Summarized findings. Connected back to research questions.'
    ]
  }
  
  const skillType = skillId === 1 ? 'coding' : 'writing'
  
  for (let i = 0; i < count; i++) {
    const baseDate = new Date('2025-09-01')
    baseDate.setDate(baseDate.getDate() + (i * 3))
    
    const duration = 1800 + Math.floor(Math.random() * 3600)
    const topic = topics[skillType][i % topics[skillType].length]
    const note = notes[skillType][i % notes[skillType].length]
    const artifactHashes = []
    
    const contentHash = computeContentHash(note, artifactHashes, duration, topic)
    const serverTs = baseDate.toISOString()
    const entryHash = computeEntryHash(prevHash, serverTs, contentHash, userId)
    
    sessions.push({
      id: i + 1,
      skill_id: skillId,
      user_id: userId,
      topic,
      notes: note,
      duration_seconds: duration,
      client_ts: baseDate.toISOString(),
      server_ts: serverTs,
      content_hash: contentHash,
      prev_hash: prevHash,
      entry_hash: entryHash,
      deleted: false,
      artifacts: [],
      github_links: skillType === 'coding' && i % 3 === 0 ? [{
        repo_url: 'https://github.com/user/learning-project',
        commit_hash: `abc${i}123def456`
      }] : []
    })
    
    prevHash = entryHash
  }
  
  return sessions
}

export const seedData = {
  user: {
    id: 1,
    email: 'demo@skillledger.com',
    display_name: 'Demo User',
    created_at: '2025-09-01T00:00:00Z'
  },
  
  skills: [
    {
      id: 1,
      user_id: 1,
      name: 'Python',
      category: 'coding',
      created_at: '2025-09-01T00:00:00Z',
      sessions: generateSessionChain(1, 1, 25),
      score: {
        score: 72,
        label: 'Evolving',
        components: {
          consistency: 65,
          depth: 78,
          progression: 70,
          external_proof: 80,
          peer_review: 45
        }
      }
    },
    {
      id: 2,
      user_id: 1,
      name: 'Academic Writing',
      category: 'writing',
      created_at: '2025-09-15T00:00:00Z',
      sessions: generateSessionChain(2, 1, 18),
      score: {
        score: 68,
        label: 'Evolving',
        components: {
          revision_count: 75,
          depth_clarity: 70,
          consistency: 60,
          citations: 65,
          external_feedback: 50
        }
      }
    }
  ],
  
  testimonials: [
    {
      name: 'Sarah Chen',
      role: 'CS Student, MIT',
      image: '👩‍💻',
      text: 'SkillLedger helped me showcase my learning journey to recruiters. They could see my progression from beginner to advanced.'
    },
    {
      name: 'Marcus Johnson',
      role: 'Tech Recruiter',
      image: '👨‍💼',
      text: 'Finally, a way to verify candidates\' learning process! The tamper-evident chain gives us confidence in their skills.'
    },
    {
      name: 'Dr. Priya Sharma',
      role: 'Research Advisor',
      image: '👩‍🏫',
      text: 'I use SkillLedger to track my students\' research progress. The timeline view makes it easy to provide targeted feedback.'
    }
  ]
}

export const getSessions = (skillId) => {
  const skill = seedData.skills.find(s => s.id === skillId)
  return skill ? skill.sessions : []
}

export const getSkill = (skillId) => {
  return seedData.skills.find(s => s.id === skillId)
}

export const getAllSkills = () => {
  return seedData.skills
}
