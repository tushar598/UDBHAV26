# UDBHAV 2026 — Team Hustlers

**Team Code:** UDB-F58X &nbsp;|&nbsp; **Problem Statement:** PS-06 — Skill Verification & Portfolio Platform

---

# CareerConnect 🚀

> *"Apply once. Let the platform do the rest."*

---

## 🎯 The Problem We Are Solving

Every year, thousands of freshers graduate with real skills — but land nowhere. Why? Not because they lack talent, but because the hiring process is broken:

- A fresher spends **hours every week** copy-pasting the same resume to dozens of job portals for the same role.
- Companies receive **hundreds of unverified applications**, with no quick way to know who actually has the skills they claim.
- There is **no single trusted place** where a candidate's GitHub contributions, LeetCode problem-solving ability, and academic qualifications are all verified and visible together.

**CareerConnect** fixes all of this — for both sides of the table.

---

## 💡 Our Solution

CareerConnect is an intelligent career platform with two missions running in parallel:

1. **For Job Seekers** — Build a verified, trusted portfolio once. Then let the platform automatically find and apply to matching jobs on your behalf, while you focus on actually preparing.
2. **For Companies** — Browse a curated pool of candidates whose skills are already authenticated from real-world sources (GitHub, LeetCode, Resume), so shortlisting takes minutes, not weeks.

---

## ✨ What Makes CareerConnect Different — Our USPs

### 🔐 1. Verified Skill Profiles (Not Just Self-Reported Claims)
Most platforms ask candidates to *type* their skills. We *verify* them.

When a user signs up, CareerConnect automatically cross-references three trusted sources:
- **Resume** — AI reads and extracts skills, qualifications, and experience directly from the uploaded PDF.
- **GitHub** — Live contribution heatmaps, repository tech-stacks, and open-source activity are pulled and displayed.
- **LeetCode** — Contest rankings, problem-solving streaks, and topic-wise performance are fetched in real time.

The result? A candidate profile that companies can *trust*, because no part of it is self-declared without proof.

---

### 🤖 2. Automated Scraping + Auto-Apply Engine
This is the feature that truly saves freshers' time.

Here is how it works, step by step:

1. **You upload your resume once.** Our AI (powered by Google Gemini) reads it and understands your skills and preferred location.
2. **The platform recommends the right job titles** for you, based on what your resume actually says — not what you think it says.
3. **Our scraping engine runs in the background** and continuously fetches fresh job and internship listings from platforms like Internshala that match your profile.
4. **Auto-Apply takes over.** For platforms like Internshala, CareerConnect can automatically fill forms, generate a relevant cover letter using AI, and submit your application — without you lifting a finger.
5. **You get notified** every time an application is sent, and every time a company shows interest.

A process that used to take hours of manual effort every week now happens automatically in the background while you sleep.

---

### 🏢 3. A Smarter Hiring Experience for Companies
For recruiters, CareerConnect acts like a pre-screened talent database.

- Browse developers filtered by verified skills, location, or experience level.
- View a candidate's full public profile — GitHub activity, LeetCode stats, parsed resume — all in one place.
- Skip the resume screening pile. The platform's AI has already assessed skill levels, so you can shortlist with confidence.
- Start a **real-time conversation** directly with candidates you are interested in, right from the dashboard — no email chains, no waiting.

---

### 🧠 4. AI-Driven Skill Level Assessment
Not all developers with "Python" on their resume are equal. CareerConnect uses AI to assess *how strong* a candidate's skills actually are, by analyzing:
- The complexity and diversity of their GitHub repositories.
- Their LeetCode problem-solving depth (Easy / Medium / Hard distribution).
- The skills extracted from their resume.

This gives companies a fair, data-backed picture of each candidate — not just a keyword match.

---

### 💬 5. Real-Time Communication, Built In
Once a company finds a candidate they like, they can initiate a live chat directly on the platform. No external tools needed. Features include:
- Real-time messaging with instant delivery.
- Typing indicators so both sides know the other is engaged.
- Read receipts and notification alerts.

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + Vite | UI framework and blazing-fast development build tool |
| Tailwind CSS 4 | Utility-first styling with dark glassmorphic design |
| Framer Motion | Smooth, fluid animations and transitions |
| React Router DOM v7 | Client-side navigation and routing |
| Socket.io-client | Real-time WebSocket communication |
| Axios | API request handling |
| Lucide React / Radix UI | Icon sets and accessible UI primitives |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express.js | REST API server and request handling |
| MongoDB + Mongoose | NoSQL database and data modelling |
| JWT + Passport.js | Secure authentication (email/password, Google OAuth, GitHub OAuth) |
| Google Gemini 2.5 Flash | AI resume parsing, skill assessment, and cover letter generation |
| Playwright | Headless browser automation for scraping and auto-apply |
| PDF.js | Server-side PDF text extraction |
| Socket.io | Real-time bi-directional event communication |
| Node-cron | Background scheduling for automated scraping jobs |

---

## 🗂️ Project Structure

```
UDBHAV26/
├── client/                      # Frontend — React Application
│   └── src/
│       ├── components/          # Reusable UI (Navbar, Heatmap, Cards, etc.)
│       ├── context/             # Global auth state (AuthContext)
│       ├── hooks/               # Custom hooks (useAuth, useSocket)
│       ├── pages/               # Full page views (Home, Profile, Dashboard, Chat, etc.)
│       ├── routes/              # Route definitions and protected route guards
│       └── services/            # Axios API call abstraction layer
│
└── server/                      # Backend — Node.js Application
    └── src/
        ├── config/              # Database connection and OAuth configurations
        ├── controller/          # Core business logic for each feature
        ├── middlewares/         # Token verification and role-based access control
        ├── models/              # MongoDB schemas (User, Job, Internship, Chat, etc.)
        ├── routes/              # API endpoint definitions
        ├── services/
        │   ├── parser/          # AI-powered PDF resume parser
        │   └── scraper/         # Playwright scrapers + Auto-Apply engine
        └── workers/             # Background cron jobs for scheduled scraping
```

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
- Node.js v18 or above
- A running MongoDB instance (local or MongoDB Atlas)
- A Google Gemini API Key
- *(Optional)* Google and GitHub OAuth credentials for social login

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>

# 2. Set up and start the backend
cd server
npm install
npm run dev

# 3. In a new terminal, set up and start the frontend
cd client
npm install
npm run dev
```

### Environment Variables

**`server/.env`**
```env
PORT=5001
CLIENT_URL=http://localhost:5173
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_API_KEY=your_gemini_api_key
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

**`client/.env`**
```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
```

The client runs on `http://localhost:5173` and the server on `http://localhost:5001`.

---

## 🧪 Demo Access

To explore the company-side features, seed a demo company account into the database:

```bash
cd server
node seedCompany.js
```

**Company Demo Login:**
- **Email:** `company@careerconnect.com`
- **Password:** `Company@123`

---

## 🌐 Who Is This For?

| User | What They Get |
|---|---|
| **Final Year Students / Freshers** | One verified profile, zero repeated applications, automated job hunting |
| **Working Professionals** | A living portfolio that updates with every GitHub commit and LeetCode solve |
| **Recruiters & Companies** | Pre-verified candidates, instant shortlisting, and direct communication |

---

## 📌 Summary

CareerConnect is not just another job portal. It is a **Skill Verification & Portfolio Platform** that authenticates who you are as a developer through your actual work — your code, your contributions, your problem-solving — and then fights for your career automatically by applying to the right opportunities on your behalf.

We eliminate the most painful and repetitive parts of job hunting, and we give companies a smarter, faster, and more trustworthy way to find the right people.

---

*Built with ❤️ by Team Hustlers — UDBHAV 2026*
