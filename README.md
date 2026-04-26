# UDBHAV26

# Team Name : Hustlers
# PS No. : 06 ( Skill Verification & portfolio platform )
Team Code : UDB-F58X


# CareerConnect 🚀

CareerConnect is a next-generation, AI-powered platform bridging the gap between developers and companies. Designed with a premium aesthetic and cutting-edge features, it offers automated resume analysis, intelligent job matching, automated application systems, and real-time communication.

## 🌟 Key Features

### For Developers 🧑‍💻
*   **AI Resume Parsing:** Upload your PDF resume, and our system extracts your skills and location.
*   **Intelligent Job & Internship Matching:** Powered by Google's Gemini 2.5 Flash, the platform recommends optimal job titles and locations based on your profile.
*   **Automated Scraping & Application:** The system automatically scrapes relevant jobs and internships (via Playwright) and can auto-apply to Internshala listings on your behalf.
*   **Profile Integration:** Connect your GitHub and LeetCode profiles to showcase your repositories, contribution heatmaps, contest rankings, and solved problems.
*   **Real-time Notifications:** Get notified instantly when a company expresses interest or sends a message.

### For Companies 🏢
*   **Premium Dashboard:** A fully responsive, glassmorphic dashboard built with Tailwind CSS and Framer Motion for a stunning user experience.
*   **Developer Discovery:** Browse and filter developers based on verified skills, location, and AI-assessed skill levels.
*   **Comprehensive Profiles:** View a developer's full public profile, including their GitHub repositories and LeetCode statistics.
*   **Instant Communication:** Initiate real-time, Socket.io-powered chats with candidates, featuring typing indicators and read receipts.

## 🛠️ Technology Stack

### Frontend (Client)
*   **Framework:** React 19 + Vite
*   **Styling:** Tailwind CSS 4 + Tailwind-merge + clsx
*   **Animations:** Framer Motion + tw-animate-css
*   **Routing:** React Router DOM v7
*   **Icons:** Lucide React & Radix UI Icons
*   **Real-time:** Socket.io-client
*   **API Communication:** Axios

### Backend (Server)
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** MongoDB & Mongoose
*   **Authentication:** JWT, Passport.js (Google & GitHub OAuth)
*   **Real-time:** Socket.io
*   **AI Integration:** Google Generative AI (Gemini 2.5 Flash)
*   **Web Scraping:** Playwright
*   **PDF Parsing:** PDF.js
*   **Task Scheduling:** Node-cron

## 📂 Project Structure

```text
ResumeScraper/
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── components/     # Reusable UI components (Navbar, GitHubHeatmap, etc.)
│   │   ├── context/        # React Context (AuthContext)
│   │   ├── hooks/          # Custom React hooks (useAuth, useSocket)
│   │   ├── pages/          # Application pages (ChatPage, CompanyDashboard, etc.)
│   │   ├── routes/         # React Router configurations
│   │   └── services/       # API integration logic
│   └── package.json
└── server/                 # Backend Node.js Application
    ├── src/
    │   ├── config/         # Database and Passport configurations
    │   ├── controller/     # Business logic (auth, parsing, scraping, chat)
    │   ├── middlewares/    # Custom middlewares (verifyToken, requireRole)
    │   ├── models/         # Mongoose schemas
    │   ├── routes/         # Express API routes
    │   ├── services/       # Scrapers (Playwright) and Parsers (PDF.js)
    │   ├── workers/        # Scheduled cron jobs
    │   ├── app.js          # Express app configuration
    │   └── socket.js       # Socket.io event handlers
    ├── seedCompany.js      # Utility script to seed demo company
    ├── server.js           # Entry point and HTTP server
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   MongoDB Instance (Local or Atlas)
*   Google Gemini API Key
*   GitHub OAuth Credentials (Optional)
*   Google OAuth Credentials (Optional)

### Installation

1.  **Clone the repository**
2.  **Install Backend Dependencies**
    ```bash
    cd server
    npm install
    ```
3.  **Install Frontend Dependencies**
    ```bash
    cd ../client
    npm install
    ```

### Environment Variables

**Server (`server/.env`)**
```env
PORT=5001
CLIENT_URL=http://localhost:5173
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_API_KEY=your_gemini_api_key
# OAuth (Optional)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

**Client (`client/.env`)**
```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
```

### Running the Application

Open two terminal windows.

**Terminal 1: Start the Backend Server**
```bash
cd server
npm run dev
```

**Terminal 2: Start the Frontend Client**
```bash
cd client
npm run dev
```

The client will run on `http://localhost:5173` and the server on `http://localhost:5001`.

## 🧪 Demo Accounts

If you need to test the company features, a demo company can be seeded into the database:

```bash
cd server
node seedCompany.js
```
**Company Login:**
*   **Email:** `company@careerconnect.com`
*   **Password:** `Company@123`

---
*Built with ❤️ for developers and recruiters alike.*
