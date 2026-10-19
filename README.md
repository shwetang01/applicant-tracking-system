# Applicant Tracking System (ATS)

A streamlined, recruiter-first Applicant Tracking System built to manage candidates across hiring stages with real-time pipeline metrics, drag-and-drop workflow, and instant search.

Built for the **Fullstack Developer Assignment** using the **MERN** stack (MongoDB Atlas, Express, React, Node.js).

---

## 🔗 Quick Links & Live Demo

| Resource | URL | Status / Notes |
|---|---|---|
| 🌐 **Live Web Application** | [https://applicant-tracking-system-peach.vercel.app](https://applicant-tracking-system-peach.vercel.app) | Deployed on Vercel |
| ⚙️ **Live Backend API** | [https://applicant-tracking-system-gwn9.onrender.com](https://applicant-tracking-system-gwn9.onrender.com) | Deployed on Render |
| 📦 **GitHub Repository** | [https://github.com/shwetang01/applicant-tracking-system](https://github.com/shwetang01/applicant-tracking-system) | Source Code |
| 🎥 **Demo Video** | [Loom / Demo Video Link — Add your video URL here] | 2-3 min Walkthrough |

---

## 🔑 Demo Account Credentials (For Instant Login)

The live database is pre-seeded with sample candidates and an active recruiter account so evaluators can test immediately without setup:

| Field | Demo Value |
|---|---|
| **Email** | `recruiter@earlyjobs.ai` |
| **Password** | `password123` |

> *Note: You can also click **"New here? Create an account"** on the login page to register a new recruiter account with your own email.*

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
