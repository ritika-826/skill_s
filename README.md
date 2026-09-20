# ⚡ Skill Specific — AI-Powered Skill Evaluation & Live Coding Platform

> An enterprise-grade, microservices-driven technical assessment platform featuring adaptive AI question generation, sandboxed code execution, dynamic proctoring, and recruiter candidate analytics.

---

## 🌟 Overview

**Skill Specific** is a full-stack technical evaluation platform engineered to replace generic quiz engines with role-specific, scenario-driven assessments. It provides candidate skill validation across 20+ engineering disciplines (DevOps, Backend, Frontend, Full Stack, Data Engineering, Security, etc.) using automated code testing, AI-backed question generation, and real-time proctoring telemetry.

---

## 🚀 Key Features

### 💻 1. Multi-Language Live Coding Sandbox
- **Automated Test Evaluation**: Executes candidate code against public and hidden test cases.
- **Language Support**: JavaScript (Node.js), Python 3, C++, Java, and C.
- **Instant Stdout & Diagnostics**: Displays standard output, execution time, and runtime errors in a high-contrast developer workspace.

### 🛡️ 2. Dynamic Integrity & Proctoring Telemetry
- **Tab-Switch Detection**: Monitors application focus loss and triggers automated session lockouts upon policy violations.
- **Webcam Monitoring Feed**: Live video stream tracking during active test sessions.
- **Sanitized Test Suites**: Hidden test cases remain isolated on the backend server to prevent client-side inspection.

### 💼 3. Recruiter Workspace & Candidate Analytics
- **Performance Leaderboards**: Candidate rankings derived from combined MCQ + Coding evaluations.
- **Topic-Level Accuracy Breakdown**: Pinpoints specific strengths and weaknesses per candidate.
- **Filterable Student Directory**: Filter candidates by target role, score band, or test date.

---

## 🏗️ System Architecture

Skill Specific is structured as a **3-Tier Microservices Architecture**:

```
                              ┌────────────────────────┐
                              │  React 19 + Vite SPA   │
                              │       (Frontend)       │
                              └───────────┬────────────┘
                                          │ HTTP / REST
                                          ▼
                              ┌────────────────────────┐
                              │ Node.js + Express API  │
                              │        (Backend)       │
                              └─────┬────────────┬─────┘
                                    │            │
             ┌──────────────────────┘            └──────────────────────┐
             ▼                                                          ▼
┌────────────────────────┐                                  ┌────────────────────────┐
│  Python 3 FastAPI      │                                  │  MongoDB Database      │
│     (AI Service)       │                                  │ (Users, Quizzes, Logs) │
└────────────────────────┘                                  └────────────────────────┘
```

---

## 📁 Repository Structure

```
skill_specific/
├── frontend/               # React 19 + Vite client SPA
│   ├── src/
│   │   ├── components/     # UI components (Navbar, Footer, Recruiter Controls)
│   │   ├── pages/          # Pages (Quiz, Setup, Results, Recruiter Dashboard)
│   │   └── services/       # Axios API client integrations
│   └── vercel.json         # Vercel SPA routing configuration
│
├── backend/                # Node.js Express REST API server
│   ├── controllers/        # Business logic (Quiz, Auth, Recruiter, Results)
│   ├── models/             # MongoDB Mongoose Schemas (User, Quiz, Question, Result)
│   ├── routes/             # API route definitions
│   └── services/           # AI & Code Execution Sandboxing Engine
│
├── ai-service/             # Python FastAPI microservice
│   ├── app/                # LangChain & Vector Retrieval pipeline
│   └── requirements.txt    # Python dependencies
│
├── kubernetes/             # K8s manifests (Deployments & Services)
└── docker-compose.yml      # Multi-container local orchestration
```

---

## 🛠️ Quick Start (Local Setup)

### Option A: Using Docker Compose (Recommended)
Run all 3 microservices and MongoDB with a single command:
```bash
docker-compose up --build
```
Access the application:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **AI Microservice**: http://localhost:8000

---

### Option B: Manual Setup

#### 1. Backend Setup
```bash
cd backend
npm install
npm start
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

#### 3. AI Service Setup
```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```

---

## 🌐 Deployment Guide

### Deploying Frontend to Vercel
1. Import repository on [Vercel](https://vercel.com).
2. Set Root Directory: `frontend`
3. Environment Variable:
   - `VITE_API_URL` = `https://your-backend-domain.com/api`
4. Click **Deploy**.

### Deploying Backend to Render / Railway
1. Create new Web Service on [Render](https://render.com).
2. Set Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `node server.js`

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
