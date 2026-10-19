# Applicant Tracking System (ATS)

Manage candidates through hiring stages (Sourced → Shortlisted → Screening → Interview → Offer → Joined / Rejected), with search and dashboard metrics. Built with the MERN stack (MongoDB, Express, React, Node.js).

UI features: Drag-and-drop pipeline Kanban board, List/Table view, click-through detail drawer, clickable funnel breakdown and stage chips, debounced live search, toasts.

- **Backend:** Express + Mongoose (`server/`)
- **Frontend:** React + Vite (`client/`)

## Run locally

```bash
# Terminal 1 - Backend
cd server
npm install
npm run seed     # Preloads realistic sample candidates & test recruiter (recruiter@earlyjobs.ai / password123)
npm run dev      # Runs API on http://localhost:5000

# Terminal 2 - Frontend
cd client
npm install
npm run dev      # Runs UI on http://localhost:5173 (proxies /api -> :5000)
```

## Auth

Recruiters sign up / log in (`POST /api/auth/register`, `/api/auth/login` → `{token}`, JWT valid 7 days). All `/api/candidates` and `/api/stats` calls need `Authorization: Bearer <token>`. Set `JWT_SECRET` in production.

## API

| Method | Path | Notes |
|---|---|---|
| GET | `/api/candidates?q=&stage=` | case-insensitive search over name, email, position, skills |
| POST | `/api/candidates` | `name`, `email` (unique), `position` required; `skills` may be a comma string |
| PUT | `/api/candidates/:id` | partial update, including `stage` |
| DELETE | `/api/candidates/:id` | |
| GET | `/api/stats` | totals, per-stage counts, joining rate, top mandates, new in last 7 days |

## Deploy

1. **DB:** MongoDB Atlas free cluster, copy the connection string.
2. **API:** Render web service, root `server`, build `npm i`, start `npm start`, env `MONGO_URI` and `JWT_SECRET`.
3. **Client:** Vercel/Netlify, root `client`, build `npm run build`, output `dist`, env `VITE_API_URL=https://<your-api>.onrender.com`.

## Not included (by design)

Roles/password reset, pagination, resume upload. Add them if the brief asks.
