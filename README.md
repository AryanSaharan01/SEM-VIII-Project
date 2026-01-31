# SkillLedger - Digital Time Capsule for Skills

> Prove how you learned, not just that you claim to know it.

<!-- [![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/) -->
[![Status](https://img.shields.io/badge/Status-In%20Development-yellow.svg)]()

## 📖 Overview

**Skill Ledger- DTCS (Digital Time Capsule for Skills)** is a learning provenance system designed to capture and verify genuine skill acquisition through time-ordered, tamper-proof records. Unlike traditional certificates or portfolios that only show final outputs, DTCS documents your entire learning journey—capturing effort, consistency, progression, and authentic struggle.

### The Problem

In education and hiring, there's no reliable way to differentiate genuine learners from bluffers. Resumes, certificates, and GitHub repositories only show results, not effort or progression. Anyone can claim skills, but few can prove the journey.

### The Solution

DTCS creates an **immutable learning timeline** that:
- 🔒 **Prevents backdating** - Every session is timestamped and cryptographically hashed
- 📊 **Tracks progression** - Shows topic mastery evolution over time
- 🎯 **Rewards consistency** - Demonstrates discipline through regular session logging
- 🧠 **Captures authentic learning** - Reflection notes reveal understanding depth
- ✅ **Generates proof** - Shareable "Skill Capsules" serve as credible learning certificates

---

## 🚀 Features

### Core Functionality
- **Session Logging** - Record learning sessions with topics, time invested, difficulty rating, and reflection notes
- **Immutability** - Once logged, sessions cannot be edited or deleted (hash-verified)
- **Heatmap Visualization** - 13-week activity calendar showing learning consistency
- **Pattern Analysis** - Detects topic revisits, learning gaps, explanation clarity improvements, and recovery behavior
- **Skill Capsules** - Generate shareable, read-only proof pages with complete learning journey
- **Multi-Skill Tracking** - Manage multiple skills simultaneously with independent timelines

### Analytics & Insights
- Consistency Score (weekly session frequency)
- Learning Velocity (time optimization over complexity)
- Topic Revisit Detection (deep learning indicators)
- Explanation Quality Analysis (note structure improvement)
- Learning Gap Identification
- Recovery Behavior Tracking

### Optional Enhancements
- **GitHub Integration** - Read public commit history to enrich learning timeline (read-only)
- **Free NLP APIs** - Analyze text complexity and detect unnatural patterns
- **Shareable Links** - Generate public URLs for skill capsules
- **PDF Export** - Download tamper-proof learning certificates

---

## 🛠️ Tech Stack

### Frontend
- **React** - Component-based UI framework
- **Tailwind CSS** - Utility-first styling
- **Chart.js** - Data visualization (heatmaps, bar/doughnut charts)
- **JavaScript** - Session management and hash generation

### Backend
- **Node.js** - REST API server
- **PostgreSQL** - Lightweight database (initial deployment)
- **Email OTP** - Authentication system

### Deployment
- **Frontend Hosting** - Netlify / Vercel (free tier)
- **Backend Hosting** - Render / Railway (free tier)
- **Database** - SQLite (serverless) → PostgreSQL (production scaling)

### Security & Verification
- **SHA-256 Hashing** - Content integrity verification
- **Timestamp Locking** - Prevents session backdating
- **Read-Only Capsules** - Shareable proof pages with no edit capabilities

---

## 📊 Supported Skill Types

DTCS supports tracking across diverse skill categories:

| Category | Examples |
|----------|----------|
| **Programming & Technical** | Java, Python, JavaScript, Web Development, DSA, Git |
| **Conceptual / Theory** | Operating Systems, DBMS, Machine Learning Theory, Algorithms |
| **Process Skills** | Consistency, Self-learning, Discipline, Time Management |
| **Documentation** | Technical Writing, Explanation Clarity, Code Comments |

---

<!-- ## 🗂️ Database Design

### Tables

#### **Users**
- `user_id` (Primary Key)
- `email`
- `name`
- `created_at`
- `github_repo` (optional)

#### **Skills**
- `skill_id` (Primary Key)
- `user_id` (Foreign Key)
- `skill_name`
- `category`
- `description`
- `created_at`

#### **Sessions**
- `session_id` (Primary Key)
- `skill_id` (Foreign Key)
- `topic`
- `time_spent` (minutes)
- `difficulty` (easy/medium/hard)
- `notes` (text/code snippet)
- `timestamp` (immutable)
- `content_hash` (SHA-256)

#### **Derived Metrics**
- `metric_id` (Primary Key)
- `user_id` / `skill_id` (Foreign Keys)
- `consistency_score`
- `total_hours`
- `topic_revisits`
- `last_updated`

--- -->

## 🎨 UI Design Philosophy

DTCS follows a **calm, academic design** approach:

- ✅ **No gamification** - No badges, streaks, or competitive leaderboards
- ✅ **Neutral color palette** - Cream, teal, soft gray tones
- ✅ **Data-first layouts** - Emphasis on timelines, charts, and metrics
- ✅ **Minimalist forms** - Focus on reflective logging, not busy inputs
- ✅ **Typography-driven** - Clear hierarchy with sans-serif fonts

### Key Pages
1. **Dashboard** - Heatmap, active skills, consistency score
2. **Session Logger** - Minimal reflective form for logging learning
3. **Insights** - Analytics on learning behavior and patterns
4. **Skill Capsule** - Shareable proof page with verification hash
5. **Settings** - GitHub integration and account management

---

## 🔐 How DTCS Proves Learning

Unlike certificates or portfolios, DTCS proves:

| Metric | Evidence |
|--------|----------|
| **Honesty** | Timestamped, immutable sessions (no backdating possible) |
| **Progression** | Clear timeline from basics to advanced topics |
| **Effort** | Total hours invested over weeks/months |
| **Consistency** | Regular sessions (not last-minute cramming) |
| **Authentic Struggle** | Topic revisits show grappling with concepts, not instant mastery |

> **DTCS doesn't stop cheating—it makes cheating obvious.**

---

## 🚦 User Flow

1. **Sign Up** - Email + OTP authentication
2. **Create Skill** - Add skill name, category, and learning goals
3. **Log Sessions** - Record topic, time spent, difficulty, and notes
4. **Review Timeline** - See immutable session history with hashes
5. **View Insights** - Analyze patterns (consistency, revisits, velocity)
6. **Generate Capsule** - Create shareable proof page with verification hash
7. **Share with Employers** - Send capsule link or PDF to recruiters/peers

---

<!-- ## 📦 Installation & Setup

### Prerequisites
- Node.js v16+ / Python 3.8+
- npm or yarn
- SQLite

### Frontend Setup
```bash
# Clone repository
git clone https://github.com/yourusername/dtcs.git
cd dtcs/frontend

# Install dependencies
npm install

# Start development server
npm start -->
