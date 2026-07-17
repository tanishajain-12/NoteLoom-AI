# NoteLoom AI

**Turn hours of lectures and meetings into minutes of insight.**

A full-stack AI-powered note summarization application. Paste a transcript — NoteLoom AI returns a structured summary, key takeaways, action items, and self-test quiz questions in seconds. All notes are persisted per-user in MongoDB and accessible through a searchable history.

---

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white&style=flat-square)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white&style=flat-square)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white&style=flat-square)
![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-8-47A248?logo=mongodb&logoColor=white&style=flat-square)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI-4285F4?logo=google&logoColor=white&style=flat-square)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [How It Works](#how-it-works)
- [Authentication & Security](#authentication--security)
- [Project Structure](#project-structure)
- [Local Setup](#local-setup)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Future Improvements](#future-improvements)

---

## Overview

NoteLoom AI solves a common pain point for students and professionals: raw transcripts from lectures, meetings, and calls are long, unstructured, and time-consuming to review. NoteLoom AI sends the transcript to Google Gemini and returns four structured outputs — a prose summary, bullet-point key points, a list of action items, and quiz question–answer pairs — all stored in MongoDB linked to the authenticated user.

---

## Features

All features listed below are fully implemented and connected to the backend.

### AI Summarization
- Accepts plain-text transcripts up to 10,000 characters (frontend limit) / 50,000 characters (backend limit)
- Sends the transcript to Google Gemini and returns structured JSON
- Outputs four sections per note: **Summary**, **Key Points**, **Action Items**, **Quiz Questions**
- Whitespace is normalised before the prompt is built to reduce token usage
- Exponential backoff retry logic for transient Gemini 503 errors; 429 quota errors fail immediately with a user-friendly message

### Authentication
- Email and password registration with bcrypt password hashing (salt rounds: 12)
- Login returns a JWT stored as an **HttpOnly cookie** and in the response body
- Session persists across page refreshes via `localStorage` (token + user object)
- Mandatory Terms & Privacy Policy checkbox on signup (enforced frontend and backend)
- Logout clears the server-side HttpOnly cookie and client-side `localStorage`

### Per-user Data
- Every note is scoped to the authenticated user's MongoDB `_id`
- All history queries are filtered by user — users never see each other's notes
- Account deletion removes the user document and all associated notes atomically

### Dashboard
- Personalised welcome message using the authenticated user's first name
- Four real-time stat cards fetched from the backend:
  - **Total Notes** — count of notes created by the user
  - **Hours Saved** — `totalNotes × 0.5` (each summary estimated to save 30 minutes)
  - **Quizzes Taken** — total quiz questions generated across all notes
  - **Avg. Accuracy** — estimated at 85% when quizzes exist (no per-answer tracking yet)
- Three most recent notes shown as clickable preview cards
- Skeleton loading states while data is fetching

### Results Page
- Displays all four AI output sections for any generated or reopened note
- Copy-to-clipboard on the Summary section
- Action item checkboxes with strikethrough on completion (local session state)
- Quiz questions as expandable accordions with a hidden reveal-answer step

### History
- Full paginated list of the user's notes, newest first
- Client-side search filtering against summary text and key points
- Click any card to reload the full note and navigate to the Results page
- Loading skeleton and empty-state messaging

### Profile
- Fetches real user data from the backend (name, email, account creation date)
- Inline name editing — click the name, press Enter or Save to persist to MongoDB
- Real stat cards (same data as the Dashboard)
- Up to 4 most recent notes listed as a clickable activity feed
- Logout confirmation modal

### Settings
- Appearance section (Dark Mode toggle — UI state only, not persisted)
- Notifications section (Email and Push toggles — UI state only, not persisted)
- **Delete Account** — confirmation dialog, calls `DELETE /api/users/profile`, deletes user and all notes, clears auth state, redirects to landing with a success banner

### Landing Page
- Public marketing page with features, how-it-works steps, and pricing tiers
- Displays a green success banner when redirected after account deletion

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | ^18.3.1 | UI library |
| React Router DOM | ^7.18.1 | Client-side routing and navigation |
| Axios | ^1.18.1 | HTTP client with request interceptor for auth |
| Tailwind CSS | ^4.3.2 | Utility-first styling |
| Vite | ^5.4.2 | Build tool and dev server |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | ≥18.0.0 | Runtime |
| Express | ^4.19.2 | HTTP server and routing |
| Mongoose | ^8.24.1 | MongoDB ODM |
| JSON Web Token | ^9.0.2 | Authentication tokens |
| bcryptjs | ^2.4.3 | Password hashing |
| cookie-parser | ^1.4.6 | HttpOnly cookie handling |
| dotenv | ^16.6.1 | Environment variable loading |
| cors | ^2.8.5 | Cross-origin request configuration |
| @google/generative-ai | ^0.24.1 | Google Gemini SDK |
| nodemon | ^3.1.4 | Dev server auto-restart |

### Infrastructure

| Service | Purpose |
|---|---|
| MongoDB Atlas | Cloud-hosted database |
| Google Gemini | AI transcript analysis |
| Vercel | Frontend hosting |
| Render | Backend hosting |

---

## How It Works

```
User (Browser)
    │
    │  1. Paste transcript → click Generate
    ▼
React Frontend (Vite)
    │
    │  2. POST /api/summarize  (JWT in Authorization header + HttpOnly cookie)
    ▼
Express Backend (Node.js)
    │
    │  3. protect middleware verifies JWT → attaches req.user
    │  4. Transcript is whitespace-normalised
    │  5. Prompt is built and sent to Google Gemini
    ▼
Google Gemini API
    │
    │  6. Returns structured JSON: summary, keyPoints, actionItems, quizQuestions
    ▼
Express Backend
    │
    │  7. Note saved to MongoDB with user: req.user._id
    │  8. Full note document returned to the frontend
    ▼
React Frontend
    │
    │  9. Navigates to /results with the note data in router state
    ▼
User sees: Summary · Key Points · Action Items · Quiz
```

All history, stats, and profile data follow the same pattern — every query is scoped to `req.user._id`, ensuring complete data isolation between users.

---

## Authentication & Security

**JWT strategy — dual delivery**

The backend issues the JWT in two ways on every successful login or registration:
1. **HttpOnly cookie** (`token`) — automatically sent by the browser, not accessible via JavaScript, mitigates XSS attacks
2. **Response body** (`token`) — stored in `localStorage.authToken` by the frontend as a fallback for cross-origin deployments where `SameSite` cookie rules may block the cookie

The frontend's Axios instance reads `localStorage.authToken` and attaches it as a `Bearer` token on every request. The backend `protect` middleware accepts whichever credential arrives — cookie or header — making it robust across both same-origin development and cross-origin production.

**Cookie settings by environment**

| Setting | Development | Production |
|---|---|---|
| `httpOnly` | true | true |
| `secure` | false | true (HTTPS only) |
| `sameSite` | lax | none (cross-origin) |

**Route protection**

- `PrivateRoute` — checks `localStorage` synchronously on every render; unauthenticated users are redirected to `/login` with the intended destination preserved in router state
- `PublicRoute` — authenticated users visiting `/login` or `/signup` are immediately redirected to `/dashboard`
- All backend note endpoints (`/api/summarize`, `/api/history`, `/api/notes/stats`) require a valid JWT via the `protect` middleware

**Password security**

Passwords are hashed with bcryptjs at salt rounds of 12 before storage. The `password` field has `select: false` on the Mongoose schema so it is never returned in query results unless explicitly requested.

**Account deletion**

`DELETE /api/users/profile` deletes both the user document and all associated `Note` documents in a single request. The server clears the HttpOnly cookie in the response. The frontend simultaneously removes `authToken` and `user` from `localStorage`.

---

## Project Structure

```
NoteLoom AI/
├── NoteLoomFrontend/               # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppLayout.jsx       # Shared app shell (sidebar + top bar)
│   │   │   ├── HistoryCard.jsx     # Summary preview card
│   │   │   ├── ProfileCard.jsx     # User card with inline name editing
│   │   │   ├── PrivateRoute.jsx    # Auth guard — redirects to /login
│   │   │   ├── PublicRoute.jsx     # Auth guard — redirects to /dashboard
│   │   │   └── ...                 # Button, Modal, Sidebar, Navbar, etc.
│   │   ├── hooks/
│   │   │   └── useLogout.js        # Calls backend logout, clears storage
│   │   ├── pages/
│   │   │   ├── Landing.jsx         # Public marketing page
│   │   │   ├── Login.jsx           # Email/password login
│   │   │   ├── SignUp.jsx          # Registration with Terms checkbox
│   │   │   ├── Dashboard.jsx       # Transcript input, stats, recent notes
│   │   │   ├── Results.jsx         # Full AI output display
│   │   │   ├── History.jsx         # Searchable note history
│   │   │   ├── Profile.jsx         # User profile with stats and activity
│   │   │   ├── Settings.jsx        # Preferences and account deletion
│   │   │   └── TermsPlaceholder.jsx
│   │   ├── services/
│   │   │   └── api.js              # All API calls, single Axios instance
│   │   ├── utils/
│   │   │   └── auth.js             # isAuthenticated, clearAuthStorage, etc.
│   │   └── App.jsx                 # Route definitions
│   ├── .env.example
│   ├── vercel.json                 # SPA rewrite rule for Vercel
│   └── package.json
│
├── server/                         # Express + Node.js backend
│   ├── config/
│   │   └── db.js                   # MongoDB Atlas connection
│   ├── controllers/
│   │   ├── authController.js       # signup, login, getProfile, logout
│   │   ├── userController.js       # updateProfile, deleteAccount
│   │   └── noteController.js       # summarize, getHistory, getHistoryById, getStats
│   ├── middleware/
│   │   ├── authMiddleware.js       # protect — JWT verification
│   │   ├── errorMiddleware.js      # Global error handler
│   │   └── validateMiddleware.js   # Input validation for auth routes
│   ├── models/
│   │   ├── User.js                 # name, email, password (hashed), timestamps
│   │   └── Note.js                 # user ref, transcript, summary, keyPoints,
│   │                               # actionItems, quizQuestions, timestamps
│   ├── routes/
│   │   ├── authRoutes.js           # /api/auth/*
│   │   ├── userRoutes.js           # /api/users/*
│   │   └── noteRoutes.js           # /api/summarize, /api/history, /api/notes/stats
│   ├── services/
│   │   └── geminiService.js        # Gemini prompt, retry logic, response parsing
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   └── generateToken.js        # JWT signing + HttpOnly cookie
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## Local Setup

### Prerequisites

- Node.js 18 or higher
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (free tier works)
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

---

### Backend

```bash
# 1. Navigate to the server directory
cd server

# 2. Install dependencies
npm install

# 3. Create the environment file
cp .env.example .env
```

Open `server/.env` and fill in your values (see [Environment Variables](#environment-variables) below).

```bash
# 4. Start the development server (auto-restarts on file changes)
npm run dev

# The API is now running at http://localhost:5000
# Health check: GET http://localhost:5000/ → { "message": "NoteLoom API is running 🚀" }
```

---

### Frontend

```bash
# 1. Navigate to the frontend directory
cd NoteLoomFrontend

# 2. Install dependencies
npm install

# 3. Create the environment file
cp .env.example .env
```

Open `NoteLoomFrontend/.env` and set `VITE_API_URL` to your running backend:

```env
VITE_API_URL=http://localhost:5000
```

```bash
# 4. Start the development server
npm run dev

# The app is now running at http://localhost:5173
```

---

## Environment Variables

### Backend — `server/.env`

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | Yes | `development` or `production` |
| `PORT` | No | Port the Express server listens on. Defaults to `5000`. |
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Long random string used to sign JWTs. Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JWT_EXPIRES_IN` | No | Token expiry duration. Defaults to `30d`. Examples: `7d`, `24h` |
| `CLIENT_URL` | Yes (prod) | Your deployed frontend URL — added to the CORS allowlist |
| `GEMINI_API_KEY` | Yes | Google Gemini API key from [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| `GEMINI_MODEL` | No | Gemini model string. Defaults to `gemini-flash-latest`. Recommended: `gemini-2.5-flash` |

### Frontend — `NoteLoomFrontend/.env`

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Base URL of the backend — no trailing slash, no `/api` suffix. Example: `http://localhost:5000` |

> **Note:** Vite only exposes variables prefixed with `VITE_` to the browser bundle. The variable is baked in at build time, so the correct value must be set before running `npm run build`.

---

## API Reference

All protected endpoints require a valid JWT sent as either:
- `Authorization: Bearer <token>` header, **or**
- `token` HttpOnly cookie

### Authentication — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user. Body: `{ name, email, password, acceptedTerms }` |
| `POST` | `/api/auth/login` | Public | Log in. Body: `{ email, password }` |
| `POST` | `/api/auth/logout` | Public | Clear the HttpOnly cookie |
| `GET` | `/api/auth/profile` | Private | Get the authenticated user's profile |

### Users — `/api/users`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/users/profile` | Private | Get the authenticated user's profile |
| `PUT` | `/api/users/profile` | Private | Update name. Body: `{ name }` |
| `DELETE` | `/api/users/profile` | Private | Delete account and all associated notes |

### Notes — `/api`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/summarize` | Private | Submit a transcript. Body: `{ transcript }`. Returns the saved note. |
| `GET` | `/api/history` | Private | List all notes for the authenticated user, newest first |
| `GET` | `/api/history/:id` | Private | Get a single note by ID (must belong to the user) |
| `GET` | `/api/notes/stats` | Private | Dashboard statistics: `{ totalNotes, hoursSaved, quizzesTaken, avgAccuracy }` |

### Response shapes

**Successful auth response** (`POST /register` and `POST /login`):
```json
{
  "_id": "...",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "token": "<jwt>"
}
```

**Note document** (returned by `POST /summarize` and `GET /history/:id`):
```json
{
  "_id": "...",
  "user": "...",
  "transcript": "...",
  "summary": "...",
  "keyPoints": ["...", "..."],
  "actionItems": ["...", "..."],
  "quizQuestions": [
    { "question": "...", "answer": "..." }
  ],
  "createdAt": "...",
  "updatedAt": "..."
}
```

**Stats response** (`GET /api/notes/stats`):
```json
{
  "totalNotes": 12,
  "hoursSaved": "6.0h",
  "quizzesTaken": 47,
  "avgAccuracy": "85%"
}
```

---

## Deployment

### Current setup

| Layer | Platform |
|---|---|
| Frontend | [Vercel](https://vercel.com) |
| Backend | [Render](https://render.com) |
| Database | [MongoDB Atlas](https://www.mongodb.com/atlas) |

### Frontend (Vercel)

`NoteLoomFrontend/vercel.json` already contains the required SPA rewrite rule:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This ensures browser refreshes and direct URL access work correctly with React Router.

**Steps:**
1. Connect the `NoteLoomFrontend` directory to a Vercel project
2. Set build command: `npm run build` — output directory: `dist`
3. Add environment variable in Vercel project settings:
   - `VITE_API_URL` → your Render backend URL (e.g. `https://your-app.onrender.com`)
4. Deploy — Vercel rebuilds automatically on every push

### Backend (Render)

**Steps:**
1. Connect the `server` directory to a Render Web Service
2. Set start command: `npm start`
3. Add environment variables in the Render dashboard (all variables from `server/.env.example`):
   - `NODE_ENV=production`
   - `MONGO_URI` → your Atlas connection string
   - `JWT_SECRET` → a long random secret
   - `JWT_EXPIRES_IN=30d`
   - `CLIENT_URL` → your Vercel frontend URL
   - `GEMINI_API_KEY` → your Gemini API key
   - `GEMINI_MODEL=gemini-2.5-flash` (or preferred model)

### Cross-origin cookie configuration

In production the backend sets cookies with `SameSite=None; Secure=true` to allow the HttpOnly cookie to be sent cross-origin (Vercel → Render). The frontend simultaneously sends the JWT as a `Bearer` token header via an Axios request interceptor as a reliable fallback.

> **Never commit `.env` files.** Both `server/.env` and `NoteLoomFrontend/.env` are listed in `.gitignore`.

---

## Screenshots

_Screenshots coming soon. To add screenshots, place images in a `docs/screenshots/` folder and reference them here._

---

## Future Improvements

The following are not yet implemented but are natural next steps:

- **Real quiz accuracy tracking** — store per-answer responses in a separate collection to calculate a true accuracy percentage instead of the current estimated value
- **Dark mode persistence** — save the user's theme preference to `localStorage` or the backend
- **Streaming AI responses** — use Gemini's streaming API to show the summary as it generates rather than waiting for the full response
- **Password reset** — email-based forgot-password flow
- **Email verification** — verify the user's email address on registration
- **Google / OAuth login** — the UI button is already present but currently disabled
- **PDF and export** — the "Download PDF" and "Export Insights" buttons are present in the UI but not yet connected to a real export implementation
- **Flashcard export** — the "Create Flashcards" button is present in the UI but not connected to an export format
- **Note deletion** — allow users to delete individual summaries from their history
- **Notification preferences persistence** — currently the toggle state is not saved anywhere

---

## License

This project is for personal and educational use. No license has been specified.
