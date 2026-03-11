# 🧠 DTCS Skill Ledger

> **Digital Time-Capsule Skill Ledger** — Prove your learning. Own your growth.

A full-stack web application that helps learners track, verify, and share their skill development journey through cryptographically-linked session logs, AI-powered analysis, GitHub integration, and shareable digital capsules.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Core Concepts & Algorithms](#-core-concepts--algorithms)
  - [Blockchain-Inspired Hashing Chain](#1-blockchain-inspired-hashing-chain)
  - [Multi-Signal Learning Phase Detection](#2-multi-signal-learning-phase-detection)
  - [XP & Score Calculation Engine](#3-xp--score-calculation-engine)
  - [Streak Algorithm](#4-streak-algorithm)
  - [AI Writing Scorer](#5-ai-writing-scorer)
  - [Activity Heatmap (GitHub-style)](#6-activity-heatmap-github-style)
- [Database Schema](#-database-schema)
- [Backend API Reference](#-backend-api-reference)
- [Frontend Architecture](#-frontend-architecture)
  - [Performance Optimizations](#performance-optimizations)
  - [UI System](#ui-system)
- [Authentication Flow](#-authentication-flow)
- [GitHub Integration](#-github-integration)
- [Capsule & Certificate System](#-capsule--certificate-system)
- [Gamification System](#-gamification-system)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
- [Security](#-security)

---

## 🌟 Overview

DTCS Skill Ledger transforms how learners document their progress. Instead of just a portfolio or a to-do list, it creates a **tamper-evident, time-stamped ledger** of every practice session. Each session is cryptographically linked to the previous one — forming an immutable chain of evidence that proves genuine, consistent learning over time.

The system automatically classifies your learning into five cognitive phases (Exposure → Proficiency), calculates a multi-dimensional skill score, uses OpenAI to critique your writing, and lets you export a shareable **digital capsule** or a verifiable **LinkedIn certificate**.

---

## 🚀 Live Demo

| | |
|---|---|
| **Frontend** | [https://skillledger.vercel.app](https://skillledger.vercel.app) |
| **Demo Login** | `demo@skillledger.com` (no password — OTP flow) |

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔐 **OTP Authentication** | Passwordless email login via 6-digit OTP with bcrypt hashing |
| 🔗 **Hashing Chain** | Every session linked via SHA-256 chain — tamper-proof learning proof |
| 🤖 **AI Session Scoring** | GPT-4o-mini evaluates writing sessions on 5 dimensions |
| 📊 **Skill Score Engine** | 7-component weighted score (consistency, depth, proof, etc.) |
| 🧠 **Phase Detection** | 6-signal algorithm auto-detects learning phase (Exposure → Proficiency) |
| 🔥 **Streak Tracking** | Day-level streak calculation with longest streak history |
| 🐙 **GitHub Integration** | OAuth, repo linking, file attachment as proof-of-work |
| 📦 **Digital Capsules** | Shareable, time-limited skill snapshots with verify URL |
| 🏆 **Certificates** | LinkedIn-ready verifiable certificates with OG image generation |
| 🥇 **Leaderboard** | XP-ranked public leaderboard |
| 📈 **Activity Heatmap** | GitHub-style contribution heatmap per year/skill |
| 🎮 **Achievements** | 12+ milestone achievements with XP rewards |
| 📱 **Responsive UI** | Glass morphism design, Framer Motion animations, mobile-ready |
| ⚡ **Performance** | Code splitting, lazy loading, list virtualization, debouncing |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                        FRONTEND                          │
│   React 19 + Vite 7 + Tailwind CSS + Framer Motion       │
│                                                          │
│  Landing Page     Dashboard        Capsule View          │
│  ─────────────    ────────────     ────────────────      │
│  Hero             Skills Grid      Public Share URL      │
│  Features         Session Logger   Chain Verification    │
│  Testimonials     Timeline (virt.) Certificate View      │
│  Leaderboard      Score Breakdown                        │
│  Heatmap          GitHub Panel                           │
└──────────────────────┬───────────────────────────────────┘
                       │ REST API (axios + JWT Bearer)
                       │
┌──────────────────────▼───────────────────────────────────┐
│                        BACKEND                           │
│          Express 5 + Node.js + PostgreSQL                │
│                                                          │
│  Routes          Services           Middleware           │
│  ───────         ────────           ──────────           │
│  /auth           XP Engine          JWT Auth             │
│  /skills         Phase Detector     Rate Limiting        │
│  /sessions       Streak Calc        Input Validation     │
│  /analytics      AI Scorer          Error Handler        │
│  /github         Certificate Gen    CORS / Helmet        │
│  /capsule        Achievement Chk    Compression          │
│  /leaderboard    Email (SMTP)                            │
└──────────────────────┬───────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────┐
│                     POSTGRESQL                           │
│  users · skills · sessions · proof_of_work              │
│  otp_store · capsule_tokens · certificates              │
│  achievement_definitions · user_achievements            │
│  github_connections                                      │
└──────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 18+ | Runtime |
| **Express** | 5.x | HTTP server & routing |
| **PostgreSQL** | 14+ | Primary database |
| **pg** | ^8.11 | PostgreSQL client with connection pooling |
| **jsonwebtoken** | ^9.0 | JWT access token generation & verification |
| **bcryptjs** | ^2.4 | OTP hashing (bcrypt, cost factor 10) |
| **nodemailer** | ^8.0 | SMTP email delivery for OTP |
| **openai** | ^6.25 | GPT-4o-mini for AI writing scoring |
| **axios** | 1.13 | GitHub API HTTP client |
| **helmet** | ^7.1 | HTTP security headers |
| **cors** | ^2.8 | Cross-Origin Resource Sharing |
| **express-rate-limit** | ^7.1 | API rate limiting |
| **express-validator** | ^7.0 | Request body validation |
| **compression** | ^1.7 | Gzip response compression |
| **morgan** | ^1.10 | HTTP request logging |
| **canvas** | ^3.2 | Server-side certificate image rendering |
| **sharp** | ^0.33 | Image processing |
| **uuid** | ^9.0 | UUID generation (v4) |
| **multer** | ^1.4 | File upload handling |
| **dotenv** | ^16.3 | Environment variable management |
| **nodemon** | ^3.0 | Dev hot-reload |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.2 | UI library |
| **Vite** | 7.3 | Build tool & dev server |
| **Tailwind CSS** | 3.4 | Utility-first CSS framework |
| **Framer Motion** | 12.34 | Animation library |
| **React Router** | 7.13 | Client-side routing |
| **@tanstack/react-virtual** | ^3.13 | List virtualization for Timeline |
| **recharts** | ^2.10 | Data visualization (score breakdown charts) |
| **lucide-react** | ^0.575 | Icon set |
| **axios** | ^1.13 | HTTP client |
| **crypto-js** | ^4.2 | Client-side SHA-256 hashing (proof chain) |
| **PostCSS + Autoprefixer** | latest | CSS processing |

---

## 🔬 Core Concepts & Algorithms

### 1. Blockchain-Inspired Hashing Chain

Every learning session is cryptographically linked to the previous one, creating an **immutable, ordered chain of evidence** — inspired by blockchain's linked-block structure.

**How it works:**

```
Session 1:  contentHash = SHA256(skillId + userId + topic + notes + duration + timestamp)
            prevHash    = "0000...0000" (genesis)
            entryHash   = SHA256(contentHash + prevHash)

Session 2:  contentHash = SHA256(session2_content)
            prevHash    = Session1.entryHash
            entryHash   = SHA256(contentHash + Session1.entryHash)

Session N:  entryHash   = SHA256(contentHash_N + entryHash_{N-1})
```

**Chain verification** walks every session in chronological order, recomputes each `entryHash`, and compares it to the stored value. Any modification to an old session breaks all subsequent hashes — making tampering detectable.

```javascript
// wallet.js — server-side
const buildContentHash = ({ skillId, userId, topic, notes, durationSeconds, clientTs }) =>
  sha256(JSON.stringify({ skillId, userId, topic, notes, durationSeconds, clientTs }));

const buildEntryHash = (contentHash, prevHash) =>
  sha256(contentHash + prevHash);

const verifyChain = (sessions) => {
  const sorted = sessions.sort((a, b) => new Date(a.client_ts) - new Date(b.client_ts));
  for (let i = 0; i < sorted.length; i++) {
    const prev = i === 0 ? GENESIS_HASH : sorted[i-1].entry_hash;
    if (buildEntryHash(sorted[i].content_hash, prev) !== sorted[i].entry_hash)
      return { valid: false, brokenAt: sorted[i].id };
  }
  return { valid: true };
};
```

The client **also** independently computes its own content hash using `crypto-js` before sending a session — the server then validates this matches, preventing forged submissions.

---

### 2. Multi-Signal Learning Phase Detection

The system auto-detects which of 5 cognitive phases a learner is in, using **6 independent signals**:

| Phase | Description | Thresholds |
|---|---|---|
| **Exposure** | Just starting, exploring | < 3 sessions or < 1 hour |
| **Confusion** | Struggling, building foundation | ≥ 3 sessions or ≥ 1 hour |
| **Learning** | Active skill building | ≥ 8 sessions + ≥ 5 hours |
| **Integration** | Connecting concepts, applying | ≥ 20 sessions + ≥ 15 hours + avg difficulty ≥ 2.2 |
| **Proficiency** | Expert-level consistency | ≥ 40 sessions + ≥ 40 hours + avg difficulty ≥ 2.8 |

**The 6 signals analyzed:**

1. **Session count** — raw volume of practice
2. **Cumulative hours** — total time invested
3. **Difficulty progression** — `easy=1, medium=2, hard=3, expert=4`; recent sessions weighted more
4. **Session regularity** — sessions in the last 14 days ÷ 14 (recency-weighted frequency)
5. **Notes depth** — average word count per session (proxy for reflection quality)
6. **Difficulty standard deviation** — high variance signals "confusion spike" (learner is stretching)

The algorithm checks phases **top-down** (Proficiency → Exposure), returning the highest phase whose thresholds are all satisfied.

---

### 3. XP & Score Calculation Engine

**XP per session** is computed with multiplicative bonuses:

```
XP = floor(durationMinutes)
   × DIFFICULTY_MULTIPLIER[difficulty]   // easy=1.0, medium=1.3, hard=1.7, expert=2.2
   × PHASE_BONUS[phase]                  // Exposure=1.0 → Proficiency=1.6
   × PROOF_BONUS                         // 1.15 if proof-of-work attached, else 1.0
```

**Skill Score (0–100)** has 7 weighted components:

| Component | Max | Algorithm |
|---|---|---|
| **Consistency** | 25 pts | Streak bonus (max 10) + frequency score (avg days between sessions → max 15) |
| **Depth** | 20 pts | Avg session duration (up to 12 pts for 1h+ avg) + avg notes length (up to 8 pts) |
| **Progression** | 20 pts | Phase map score (Exposure=2 → Proficiency=20) |
| **Volume** | 15 pts | Session count (max 10 at 50 sessions) + total hours (max 5 at 50 hours) |
| **External Proof** | 10 pts | % of sessions with proof-of-work attached |
| **AI Review** | 5 pts | Average AI writing score normalized to 0–5 |
| **Diversity** | 5 pts | Unique topic count + difficulty spread entropy |

---

### 4. Streak Algorithm

Streaks are calculated at **day granularity** (not session granularity) — one or more sessions on the same day counts as one "streak day."

```javascript
// streak.service.js
const calculate = async (client, userId, skillId, newSessionTs) => {
  // 1. Fetch all distinct session days for this skill, DESC
  // 2. Include today if not already in list
  // 3. Walk consecutive pairs: if gap == 86400000ms (exactly 1 day) → continue streak
  // 4. Break at first non-consecutive gap → that's the current streak
  // 5. Full sort ASC → scan for longest consecutive run
  return { current, longest };
};
```

The streak is **per-skill** (not global), so a learner has individual streaks for each tracked skill.

---

### 5. AI Writing Scorer

For sessions categorized under **writing** skills, the system sends the notes to **GPT-4o-mini** for structured evaluation.

**5 dimensions, each 0–20 points (total 0–100):**

| Dimension | What it measures |
|---|---|
| **Clarity** | Writing coherence and logical flow |
| **Depth** | Genuine understanding demonstrated |
| **Vocabulary** | Appropriate domain terminology usage |
| **Structure** | Organization, headings, examples used |
| **Reflection** | Self-awareness, questions raised, next steps noted |

**Optimizations:**
- Notes under 15 words are skipped (not worth scoring)
- Notes truncated to 2,000 characters before sending
- `response_format: { type: "json_object" }` → structured JSON output, no parsing guesswork
- `temperature: 0.2` → deterministic, consistent scores
- `max_tokens: 250` → minimal cost (~$0.0002 per session with gpt-4o-mini)
- All dimension scores clamped to `[0, 20]` before storage
- Results stored as `JSONB` in PostgreSQL `sessions.ai_score` column
- Batch scoring endpoint available for retroactive scoring of unscored sessions

---

### 6. Activity Heatmap (GitHub-style)

The analytics endpoint builds a **52-week grid** of session activity, aligned to Monday:

```javascript
// analytics.js
// 1. Query: GROUP BY DATE(client_ts) → { date, count }
// 2. Build a date map: { "2025-03-11": 3, ... }
// 3. Align startDate to the nearest Monday before Jan 1
// 4. Iterate week by week (7 days each) through the full year
// 5. Each cell: { date: "YYYY-MM-DD", count: N }
// 6. Return 52 (or 53) week arrays → renders as GitHub-style heatmap
```

Color intensity is computed client-side based on `count` (0 = no activity, 1–2 = light, 3–4 = medium, 5+ = intense).

---

## 🗄️ Database Schema

```sql
users              — UUID PK, email, username, github_id, total_xp
otp_store          — email, otp_hash (bcrypt), expires_at, used flag
skills             — UUID PK, user_id FK, name, category, score, phase, streak, hours
sessions           — UUID PK, skill_id FK, topic, notes, duration_seconds, difficulty,
                     phase, xp_earned, content_hash, entry_hash, prev_hash, ai_score JSONB
proof_of_work      — session_id FK, type (github|upload), name, path, file_hash
capsule_tokens     — UUID PK, skill_id FK, token, expires_at, view_count, stats snapshot
certificates       — UUID PK, skill_id FK, cert_token, image_url, metadata JSONB
achievement_definitions — key, title, description, xp_reward
user_achievements  — user_id FK, achievement_key FK (unique per user)
github_connections — user_id FK (unique), github_login, access_token, repos JSONB, selected_repos JSONB
```

**Key design decisions:**
- UUIDs everywhere (no sequential integer IDs exposed publicly)
- `TIMESTAMPTZ` for all timestamps (timezone-aware)
- `ON DELETE CASCADE` on all child tables
- `JSONB` for flexible AI scores, repo lists, and certificate metadata
- `updated_at` auto-managed by PostgreSQL trigger on `users` and `skills`
- Composite indexes on `sessions(skill_id)`, `sessions(user_id)`, `sessions(client_ts)`

---

## 🌐 Backend API Reference

### Authentication — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/send-otp` | Public | Send 6-digit OTP to email (rate: 5/15min) |
| `POST` | `/verify-otp` | Public | Verify OTP → returns JWT token |
| `GET` | `/me` | JWT | Get current user profile |
| `PUT` | `/profile` | JWT | Update display name, username, bio |
| `POST` | `/github/oauth` | JWT | Complete GitHub OAuth → link account |

### Skills — `/api/skills`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | JWT | List all skills for current user |
| `POST` | `/` | JWT | Create new skill |
| `GET` | `/:id` | JWT | Get skill detail with stats |
| `DELETE` | `/:id` | JWT | Delete skill + cascade sessions |
| `PATCH` | `/:id/repo` | JWT | Link a GitHub repo to a skill |

### Sessions — `/api/sessions`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | JWT | Paginated session list (skillId filter, page, limit) |
| `POST` | `/` | JWT | Log a new session (triggers chain + XP + phase + streak + achievements) |
| `GET` | `/:id` | JWT | Get session with proof-of-work |
| `POST` | `/:id/proof` | JWT | Attach proof-of-work (GitHub file or upload) |

### Analytics — `/api/analytics`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/heatmap` | JWT | 52-week activity heatmap (year, skillId filters) |
| `GET` | `/score/:skillId` | JWT | Full 7-component score breakdown |

### GitHub — `/api/github`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/status` | JWT | Check connection status + selected repos |
| `GET` | `/repos` | JWT | Fetch all repos from GitHub API (cached) |
| `GET` | `/selected-repos` | JWT | Get user's chosen repos |
| `PATCH` | `/selected-repos` | JWT | Update selected repos |
| `GET` | `/files/:owner/:repo` | JWT | Browse repo file tree |
| `DELETE` | `/disconnect` | JWT | Unlink GitHub account |

### Capsule — `/api/capsule`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/generate` | JWT | Generate shareable capsule token (30-day expiry) |
| `GET` | `/history/:skillId` | JWT | List previous capsule links |
| `GET` | `/:token` | Public | View capsule (increments view_count) |
| `GET` | `/:token/verify` | Public | Verify chain integrity for capsule |
| `POST` | `/certificate` | JWT | Generate LinkedIn certificate |

### Leaderboard — `/api/leaderboard`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | Public | XP-ranked leaderboard (limit up to 100) |

### Achievements — `/api/achievements`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | JWT | List all achievements + user's earned ones |

---

## ⚛️ Frontend Architecture

### Pages

| Page | Route | Description |
|---|---|---|
| `Landing` | `/` | Marketing page with interactive animations |
| `Dashboard` | `/dashboard` | Main app — skills, sessions, analytics |
| `CapsuleView` | `/capsule/:token` | Public shareable skill capsule |

### Components

```
components/
├── auth/
│   ├── LoginModal.jsx       — Email input + OTP flow
│   └── OTPVerification.jsx  — 6-digit OTP input with countdown
├── common/
│   └── ScrollToTop.jsx      — Route-change scroll reset
├── dashboard/
│   ├── SkillCard.jsx         — Skill card with score ring + phase badge
│   ├── SessionLogger.jsx     — Multi-step session logging form
│   ├── Timeline.jsx          — Virtualized session list (react-virtual)
│   ├── ActivityHeatmap.jsx   — 52-week GitHub-style heatmap
│   ├── ScoreBreakdown.jsx    — 7-component score with Recharts radar
│   ├── CapsuleExport.jsx     — Generate + manage capsule links
│   ├── ProofOfWork.jsx       — GitHub file selector / file upload
│   ├── GitHubConnect.jsx     — GitHub OAuth flow + repo selection
│   ├── SessionDetail.jsx     — Single session view with chain info
│   ├── AddSkillModal.jsx     — Create new skill form
│   └── Sidebar.jsx           — Nav sidebar (desktop)
└── landing/
    ├── Hero.jsx              — Animated hero with particle canvas + typing text
    ├── Features.jsx          — Feature grid with scroll animations
    ├── HowItWorks.jsx        — Step-by-step explainer
    ├── Testimonials.jsx      — Testimonial cards
    ├── WhyDTCS.jsx           — Comparison table
    └── Footer.jsx            — Links + social
```

### Performance Optimizations

#### Code Splitting & Lazy Loading
Heavy dashboard sub-views are **code-split** via `React.lazy` + `Suspense`:
```jsx
const Timeline      = lazy(() => import('../components/dashboard/Timeline'))
const ActivityHeatmap = lazy(() => import('../components/dashboard/ActivityHeatmap'))
const ScoreBreakdown  = lazy(() => import('../components/dashboard/ScoreBreakdown'))
// ... etc.
```

#### Vite Manual Chunks
```javascript
// vite.config.js
manualChunks: {
  'react-vendor':  ['react', 'react-dom', 'react-router-dom'],
  'animation':     ['framer-motion'],
  'charts':        ['recharts'],
  'icons':         ['lucide-react'],
}
```
This prevents all libraries from landing in one giant bundle, enabling better browser caching.

#### List Virtualization
The Timeline tab renders only the **visible** sessions using `@tanstack/react-virtual`:
```jsx
const rowVirtualizer = useVirtualizer({
  count: sessions.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 120,     // ~120px per session row
  overscan: 5,                 // pre-render 5 items above/below viewport
})
```
This keeps rendering fast even with hundreds of sessions.

#### Debouncing & Throttling
Custom hooks in `utils/hooks.js`:
```javascript
useDebounce(value, delay)         // debounced reactive value
useDebouncedCallback(fn, delay)   // debounced event handler
useThrottle(value, interval)      // throttled reactive value
useThrottledCallback(fn, interval)// throttled event handler (mouse move, scroll)
useMousePosition(throttleMs)      // throttled mouse tracking for glow effects
```

#### `useMemo` & `useCallback`
Expensive computations (filtering sessions by skill, aggregating stats) and event handlers are memoized to avoid unnecessary re-renders throughout `Dashboard.jsx`.

### UI System

#### Glass Morphism
All cards use a layered glass effect system:
```css
.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.05);
}
.glass-glow {
  box-shadow: 0 0 40px rgba(168, 85, 247, 0.12); /* violet ambient glow */
}
```

#### Color Palette
| Token | Value | Usage |
|---|---|---|
| `primary-500` | `#a855f7` | Violet — primary actions, highlights |
| `primary-400` | `#c084fc` | Lighter violet — hover states, particles |
| `primary-700` | `#7e22ce` | Dark violet — button gradients |
| `accent-500` | `#f59e0b` | Amber — secondary accents, XP badges |
| `accent-400` | `#fbbf24` | Light amber — shimmer, icons |
| Background | `#0c0a13` | Warm dark purple-black |

#### Animation Stack
- **Framer Motion** — page transitions, staggered list entries, scroll-triggered reveals (`useInView`), modal presence
- **Canvas API** — animated particle field in Hero section (custom RAF loop)
- **CSS keyframes** — shimmer text, floating elements, pulse glows, gradient backgrounds
- **Intersection Observer** — via custom `useInView` hook for triggering count-up stats and card entrance animations

---

## 🔐 Authentication Flow

```
User enters email
       │
       ▼
POST /api/auth/send-otp
  ├── Rate limit: 5 requests per 15 minutes (per IP)
  ├── Invalidate any existing OTPs for this email
  ├── Generate cryptographically-random 6-digit OTP via crypto.randomInt()
  ├── Hash OTP with bcrypt (cost factor 10) → store in otp_store
  └── Send styled HTML email via Nodemailer (SMTP)

User enters OTP
       │
       ▼
POST /api/auth/verify-otp
  ├── Find latest unused, non-expired OTP for email
  ├── bcrypt.compare(inputOTP, stored_hash)
  ├── Mark OTP as used
  ├── CREATE user if new email (auto-registration)
  └── Sign JWT (userId payload, configurable expiry)
         │
         ▼
   JWT stored in localStorage → sent as Bearer token on all future requests

Protected routes → authenticate middleware
  ├── Extract Bearer token from Authorization header
  ├── jwt.verify() → decode userId
  └── Query user from DB → attach to req.user
```

---

## 🐙 GitHub Integration

1. **OAuth Flow** — Frontend redirects to GitHub's OAuth authorize URL. After approval, GitHub redirects back with a `code`. The frontend sends this code to `POST /api/auth/github/oauth`, which exchanges it for an access token via the GitHub API.

2. **Repository Caching** — `GET /api/github/repos` fetches up to 100 repos from `GET https://api.github.com/user/repos` and caches them in the `github_connections.repos` JSONB column to minimize GitHub API calls.

3. **Repo Selection** — Users can select specific repos to link to each skill. Selected repos are stored in `github_connections.selected_repos`.

4. **Proof-of-Work** — When logging a session, users can browse the file tree of any linked repo (`GET /api/github/files/:owner/:repo`) and attach specific files as evidence of their work. Each attached file is recorded in the `proof_of_work` table.

5. **Rate Limiting** — GitHub API calls are protected by a per-user rate limiter (30 requests per minute) to avoid hitting GitHub's API limits.

---

## 📦 Capsule & Certificate System

### Digital Capsule

A capsule is a **point-in-time, publicly shareable snapshot** of a skill:

```
POST /api/capsule/generate
  ├── Generate 32-byte random hex token (crypto.randomBytes)
  ├── Snapshot: total_sessions, total_hours, score at time of generation
  ├── Store with 30-day expiry (configurable via CAPSULE_TOKEN_EXPIRY_DAYS)
  └── Return public URL: https://skillledger.vercel.app/capsule/:token

GET /api/capsule/:token  (public, no auth)
  ├── Fetch capsule + linked skill + user data
  ├── Increment view_count
  ├── Include all sessions (for chain verification display)
  └── Verify chain integrity on-the-fly → { valid: true/false }
```

### Verifiable Certificate

Certificates are **LinkedIn-ready** credential cards:

- Unique `cert_token` — permanent, never expires
- Metadata stored as JSONB: skill name, score, phase, hours, learner name, issue date
- Server-side PNG generation using `canvas` library
- `GET /api/capsule/certificate/:token/image` serves the certificate image
- LinkedIn OpenGraph meta tags served at the certificate URL → rich card preview when shared
- Pre-built LinkedIn Share URL with `certificationName`, `certUrl`, `organizationId` params

---

## 🎮 Gamification System

### XP System
- XP earned on every session (formula: see [XP Engine](#3-xp--score-calculation-engine))
- Total XP accumulates on `users.total_xp`
- Powers the global leaderboard ranking

### Achievements (12 milestones)

| Key | Trigger |
|---|---|
| `first_session` | Log your very first session |
| `streak_7` | Maintain a 7-day streak on any skill |
| `streak_30` | Maintain a 30-day streak |
| `sessions_10` | Reach 10 sessions on any skill |
| `sessions_50` | Log 50 total sessions |
| `hours_10` | Accumulate 10+ hours on any skill |
| `hours_100` | Accumulate 100+ hours on any skill |
| `phase_integration` | Reach Integration or Proficiency phase |
| `phase_proficiency` | Reach Proficiency phase |
| `first_proof` | Attach first proof-of-work |
| `github_connected` | Connect GitHub account |
| `score_80` | Achieve skill score ≥ 80 |
| `score_95` | Achieve skill score ≥ 95 |

Achievements are checked **after every session save** inside a database transaction. Only newly earned achievements trigger XP reward and notification.

### Leaderboard
- Aggregates `total_xp`, skill count, and total seconds across all users with a set username
- Returns ranked list ordered by XP descending
- Public endpoint (no auth required)

---

## 📁 Project Structure

```
Skill Ledger 2/
├── README.md
│
├── backend/
│   ├── server.js                  ← Express app entry, middleware chain
│   ├── package.json
│   ├── smtp-test.js               ← SMTP connectivity test script
│   │
│   ├── config/
│   │   ├── db.js                  ← pg Pool setup, testConnection()
│   │   └── env.js                 ← dotenv load + required var warnings
│   │
│   ├── database/
│   │   ├── schema.sql             ← Full DB schema (idempotent CREATE IF NOT EXISTS)
│   │   ├── seed.sql               ← Achievement definitions seed data
│   │   └── migrations/
│   │       ├── 001_add_selected_repos.sql
│   │       └── add_capsule_snapshots.sql
│   │
│   ├── middleware/
│   │   ├── auth.js                ← JWT authenticate + optionalAuth
│   │   ├── errorHandler.js        ← Global error → JSON response
│   │   └── validate.js            ← express-validator result handler
│   │
│   ├── routes/
│   │   ├── index.js               ← Route aggregator
│   │   ├── auth.js                ← OTP + GitHub OAuth
│   │   ├── skills.js              ← CRUD for skills
│   │   ├── sessions.js            ← Session CRUD + chain + XP pipeline
│   │   ├── analytics.js           ← Heatmap + score breakdown
│   │   ├── github.js              ← GitHub API proxy + repo management
│   │   ├── capsule.js             ← Capsule tokens + certificate
│   │   ├── achievements.js        ← Achievement list
│   │   ├── leaderboard.js         ← Public leaderboard
│   │   └── users.js               ← User profile updates
│   │
│   ├── services/
│   │   ├── ai.service.js          ← OpenAI writing scorer
│   │   ├── xp.service.js          ← XP calculation + 7-component score
│   │   ├── phase.service.js       ← 6-signal phase detection
│   │   ├── streak.service.js      ← Day-level streak calculation
│   │   ├── achievement.service.js ← Achievement check + award pipeline
│   │   └── certificate.service.js ← Certificate generation + LinkedIn URL
│   │
│   └── utils/
│       ├── wallet.js              ← SHA-256 hashing chain functions
│       ├── errors.js              ← Custom error classes
│       └── response.js            ← Standardized success/error/paginated helpers
│
└── frontend/
    ├── index.html
    ├── vite.config.js             ← Build config + manual chunks
    ├── tailwind.config.js         ← Color palette + custom keyframes
    ├── postcss.config.js
    ├── eslint.config.js
    │
    └── src/
        ├── main.jsx               ← React root, Router setup
        ├── App.jsx                ← Auth state, route guards
        ├── index.css              ← Glass morphism system, animations
        ├── App.css
        │
        ├── pages/
        │   ├── Landing.jsx        ← Marketing page (lazy loads sections)
        │   ├── Dashboard.jsx      ← Main app shell (764 lines)
        │   └── CapsuleView.jsx    ← Public capsule display
        │
        ├── components/
        │   ├── auth/              ← LoginModal, OTPVerification
        │   ├── common/            ← ScrollToTop
        │   ├── dashboard/         ← All dashboard sub-components
        │   └── landing/           ← Hero, Features, HowItWorks, etc.
        │
        ├── services/
        │   └── api.js             ← All API calls + demo seed data
        │
        └── utils/
            ├── helpers.js         ← formatDuration, formatDate, SHA-256 client-side
            ├── hooks.js           ← useDebounce, useThrottle, useInView, useMousePosition
            └── seedData.js        ← Demo user seed sessions
```

---

## ⚙️ Environment Variables

### Backend (`.env`)

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/skillledger

# Auth
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# OTP
OTP_EXPIRY_MINUTES=10

# SMTP (Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password

# App URLs
APP_URL=https://skillledger.vercel.app
API_URL=https://your-backend.railway.app

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# OpenAI
OPENAI_API_KEY=sk-...
AI_MODEL=gpt-4o-mini

# Capsule
CAPSULE_TOKEN_EXPIRY_DAYS=30
CERT_ISSUER=DTCS Skill Ledger

# Server
PORT=5000
NODE_ENV=production
```

### Frontend (`.env`)

```env
VITE_API_URL=https://your-backend.railway.app/api
VITE_GITHUB_CLIENT_ID=your_github_client_id
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **PostgreSQL** 14+
- **npm** or **yarn**
- A Gmail account (or other SMTP) for email OTP
- OpenAI API key (optional — only needed for AI writing scoring)
- GitHub OAuth App (optional — only needed for GitHub integration)

### 1. Clone the Repository

```bash
git clone https://github.com/AryanSaharan01/Skill-Ledger-Deploy.git
cd Skill-Ledger-Deploy
```

### 2. Database Setup

```bash
# Create database
psql -U postgres -c "CREATE DATABASE skillledger;"

# Run schema
psql -U postgres -d skillledger -f backend/database/schema.sql

# Seed achievement definitions
psql -U postgres -d skillledger -f backend/database/seed.sql
```

### 3. Backend Setup

```bash
cd backend
npm install

# Create .env file (see Environment Variables section above)
cp .env.example .env
# Edit .env with your values

npm run dev    # Development (nodemon)
npm start      # Production
```

### 4. Frontend Setup

```bash
cd frontend
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

npm run dev    # Development server at http://localhost:5173
npm run build  # Production build
npm run preview # Preview production build
```

### 5. Test Email Configuration

```bash
cd backend
node smtp-test.js
```

---

## 🛡️ Security

| Concern | Implementation |
|---|---|
| **SQL Injection** | Parameterized queries via `pg` — no string concatenation in SQL |
| **XSS** | `helmet` sets `Content-Security-Policy`, `X-XSS-Protection` headers |
| **CORS** | Allowlist of origins; credentials mode; preflight handled |
| **Rate Limiting** | Global: 200 req/15min. OTP: 5 req/15min. GitHub: 30 req/min |
| **Auth** | Stateless JWT; OTPs stored as bcrypt hashes, expired and marked used after verify |
| **Input Validation** | `express-validator` on all POST/PUT endpoints |
| **Password-free** | No passwords stored — OTP-only authentication |
| **Token Expiry** | JWT configurable expiry; OTPs expire in 10 minutes |
| **HTTPS** | Enforced via deployment platform (Vercel/Railway) |
| **Secrets** | All secrets in `.env`, never committed; `config/env.js` warns on missing vars |
| **File Uploads** | `multer` + `sharp` for image validation; type and size restricted |

---

## 📄 License

MIT License — feel free to fork and build on top of this.

---

<div align="center">

**Built with ❤️ by Aryan Saharan**

*Track real effort. Prove real growth.*

</div>
