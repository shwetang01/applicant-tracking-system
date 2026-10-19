# Applicant Tracking System (ATS)

A streamlined, recruiter-first Applicant Tracking System built to manage candidates across hiring stages with real-time pipeline metrics, drag-and-drop workflow, and instant search.

Built for the **Fullstack Developer Assignment** using the **MERN** stack (MongoDB Atlas, Express, React, Node.js).

---

## 🔗 Quick Links

- **GitHub Repository:** [https://github.com/shwetang01/applicant-tracking-system](https://github.com/shwetang01/applicant-tracking-system)
- **Live Web Application:** [https://applicant-tracking-system-peach.vercel.app](https://applicant-tracking-system-peach.vercel.app)
- **Live Backend API:** [https://applicant-tracking-system-gwn9.onrender.com](https://applicant-tracking-system-gwn9.onrender.com)
- **Demo Video Walkthrough:** [Loom / Demo Video Link — Add your video URL here]

---

## 💡 Why This Design? (Recruiter-First Approach)

Recruiters review dozens of candidates daily and need an interface that stays out of their way. Every decision in this project was made for speed and clarity:

1. **Zero-Lag Kanban Board:** Built with native HTML5 drag-and-drop and optimistic UI updates. When you drop a card into another stage, the UI updates instantly while syncing to the backend asynchronously.
2. **Interactive Funnel & Metrics:** The pipeline funnel isn't just a static progress bar—clicking any stage segment immediately filters your candidate list to that specific stage.
3. **No Page Reloads (Drawer UX):** Clicking any candidate opens a smooth slide-out drawer to view notes, update contact info, or switch stages without losing your position on the board.
4. **Dual Perspective (Board vs List):** Toggle between visual columns (Kanban) and high-density tabular view depending on whether you're prioritizing workflow progression or data scanning.
5. **Debounced Live Search:** 250ms debounce queries across candidate name, email, target role, and technical skills simultaneously.

---

## 🚀 Demo / Evaluation Credentials

A demo recruiter account and realistic candidate profiles are pre-seeded in the database:

- **Recruiter Login:** `recruiter@earlyjobs.ai`
- **Password:** `password123`
*(You can also click "New here? Create an account" to register your own account)*

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** React 18, Vite, Vanilla CSS design system (custom tokens, smooth transitions, mobile responsive).
- **Backend:** Node.js, Express 4 REST API, Mongoose 8 ODM.
- **Database:** MongoDB Atlas (Cloud Cluster).
- **Authentication:** Stateless JWT bearer tokens (7-day validity) with bcrypt password hashing.
- **State & Sync:** Optimistic updates, debounced backend queries, local storage view persistence.

---

## 📋 Hiring Pipeline Stages

Candidates progress through 7 distinct stages:

```
[ Sourced ] ➔ [ Shortlisted ] ➔ [ Screening ] ➔ [ Interview ] ➔ [ Offer ] ➔ [ Joined ]
                                                                       ↘ [ Rejected ]
```

---

## 💻 Running Locally

### Prerequisites
- Node.js (v18+)
- MongoDB (local service or MongoDB Atlas cloud connection string)

### 1. Clone the repository
```bash
git clone https://github.com/shwetang01/applicant-tracking-system.git
cd applicant-tracking-system
```

### 2. Backend Setup
```bash
cd server
npm install

# Create .env (already templated in .env.example)
# MONGO_URI=mongodb://127.0.0.1:27017/ats (or your Atlas URI)
# JWT_SECRET=your-secret-key

# Seed test recruiter and 8 realistic candidate profiles
npm run seed

# Start API server (runs on http://localhost:5000)
npm run dev
```

### 3. Frontend Setup
```bash
# In a new terminal:
cd client
npm install

# Start Vite dev server (runs on http://localhost:5173, proxies /api -> :5000)
npm run dev
```

Open **`http://localhost:5173`** in your browser and log in with `recruiter@earlyjobs.ai` / `password123`.

---

## 📡 REST API Reference

All `/api/candidates` and `/api/stats` routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new recruiter account (`email`, `password` 6+ chars) |
| `POST` | `/api/auth/login` | Log in and receive JWT token (`email`, `password`) |
| `GET` | `/api/candidates` | List candidates. Supports `?q=<term>` and `?stage=<stage>` |
| `POST` | `/api/candidates` | Add a new candidate (`name`, `email`, `position`, `skills`, `notes`, `stage`) |
| `PUT` | `/api/candidates/:id` | Update candidate details or move stage |
| `DELETE` | `/api/candidates/:id` | Remove candidate from pipeline |
| `GET` | `/api/stats` | Pipeline metrics (total, per-stage count, joining rate %, top roles, last 7 days) |
| `GET` | `/api/health` | Health check endpoint |

---

## ☁️ Deployment Guide

### Backend (Render / Railway)
- **Root Directory:** `server`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment Variables:**
  - `MONGO_URI`: `mongodb+srv://...` (MongoDB Atlas URI)
  - `JWT_SECRET`: Random secure string
  - `PORT`: `5000`

### Frontend (Vercel / Netlify)
- **Root Directory:** `client`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variable:**
  - `VITE_API_URL`: URL of your deployed backend (e.g. `https://your-ats-api.onrender.com`)

---

## 👤 Author
- **Shwetang** — [GitHub Profile](https://github.com/shwetang01)
