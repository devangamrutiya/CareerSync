# CareerSync - AI-Powered Job Application Manager

A full-stack web application that helps job seekers streamline their application process with AI-powered resume optimization and intelligent job tracking.

## 🎯 Features

- **User Authentication**: Secure JWT-based authentication with Google OAuth support
- **Job Tracking**: Manage your job applications with status tracking and timeline
- **Gmail Integration**: Auto-detect and import job-related emails from your inbox
- **AI Resume Optimization**: Tailor your resume to specific job descriptions using AI
- **Resume Management**: Upload PDFs/DOCX, extract text, and generate optimized versions
- **Dashboard**: Intuitive interface to manage your job search pipeline
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14+ (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks + API integration

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + Google OAuth 2.0
- **AI Engine**: Ollama (local LLM for extraction & resume rewriting)
- **Email Integration**: Gmail API

### DevOps & Tools
- **Package Manager**: npm/yarn
- **Linting**: ESLint
- **Testing**: Jest
- **Database Migrations**: Prisma Migrations

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL 12+
- Ollama (for AI features)
- Google OAuth credentials (for social login)
- Gmail API credentials (for email integration)

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/devangamrutiya/CareerSync.git
cd CareerSync


2. Install Dependencies
Backend:

cd server
npm install

Frontend:

cd ../client
npm install

3. Setup Environment Variables
Backend (.env):

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/careersync"

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# Gmail API
GMAIL_API_KEY=your_gmail_api_key

# Ollama
OLLAMA_API_URL=http://localhost:11434

# App
NODE_ENV=development
PORT=3001

Frontend (.env.local):

NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000

4. Setup Database
Create PostgreSQL database:

createdb careersync

Run migrations:

cd server
npx prisma migrate deploy


📚 Running the Project
Development Mode
Backend (from server directory):

npm run start:dev



📁 Project Structure


CareerSync/
├── client/                          # Next.js Frontend
│   ├── src/
│   │   ├── app/                    # Next.js App Router
│   │   │   ├── page.tsx            # Landing page
│   │   │   ├── dashboard/          # Dashboard pages
│   │   │   ├── login/              # Auth pages
│   │   │   └── register/
│   │   ├── components/             # React Components
│   │   │   ├── landing/            # Landing page sections
│   │   │   └── ui/                 # Reusable UI components
│   │   └── lib/                    # Utilities & API client
│   └── package.json
│
├── server/                          # NestJS Backend
│   ├── src/
│   │   ├── main.ts                 # App entry point
│   │   ├── auth/                   # Authentication module
│   │   ├── users/                  # User management
│   │   ├── jobs/                   # Job tracking API
│   │   ├── resumes/                # Resume management
│   │   ├── resume-optimizer/       # AI resume optimization
│   │   ├── gmail/                  # Gmail integration
│   │   ├── gemini/                 # AI service integration
│   │   ├── prisma/                 # Database service
│   │   └── config/                 # Configuration
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema
│   │   └── migrations/             # DB migrations
│   └── package.json
│
├── README.md
├── PROJECT_PURPOSE.md
└── PRODUCTION_HARDENING.md


📧 Gmail Integration
Connect your Gmail account via Google OAuth
Trigger "Sync Gmail" from the dashboard
System automatically extracts job-related emails
Job metadata (company, role, status) is extracted using AI

🤖 AI Features
Resume Optimization
Upload your resume (PDF or DOCX)
Paste target job description
AI analyzes and rewrites your resume for the specific role
Download optimized PDF


📝 API Documentation
Authentication Endpoints
POST /api/auth/register - Register new user
POST /api/auth/login - Login user
GET /api/auth/google - Google OAuth redirect
GET /api/auth/google/callback - Google OAuth callback
Job Management
GET /api/jobs - List user's jobs
POST /api/jobs - Create new job
PATCH /api/jobs/:id - Update job
DELETE /api/jobs/:id - Delete job
Resume Optimization
POST /api/resume-optimizer/upload - Upload resume
POST /api/resume-optimizer/optimize - Optimize resume for job
Gmail Integration
POST /api/gmail/sync - Sync Gmail emails
GET /api/gmail/status - Check Gmail connection status

Built with ❤️ by the CareerSync Team

