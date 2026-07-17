# NoteLoom AI — Frontend

React + Vite frontend for NoteLoom AI, an application that turns lecture and meeting transcripts into structured AI-generated summaries, key points, action items, and quiz questions.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [API Dependency](#api-dependency)
- [Authentication Flow](#authentication-flow)
- [Routes](#routes)
- [Deployment](#deployment)

---

## Project Overview

NoteLoom AI allows authenticated users to paste a transcript (up to 10,000 characters) and receive a structured AI analysis including a prose summary, bullet-point key takeaways, action items, and self-test quiz questions. All generated notes are stored per-user in the backend and accessible through a searchable history.

---

## Features

The following features are fully implemented and connected to the backend:

**Authentication**
- User registration with name, email, password, and mandatory Terms & Privacy checkbox
- Email/password login with JWT authentication
- Session persistence across page refreshes via `localStorage`
- Logout with server-side HttpOnly cookie clearing
- Account deletion — permanently removes the user and all their notes from the database

**Dashboard**
- Transcript input (plain text, up to 10,000 characters) with live character counter
- AI summary generation via the backend Gemini integration
- Real-time stats cards: Total Notes, Hours Saved, Quizzes Taken, Avg. Accuracy (all fetched from the backend)
- Up to 3 most recent notes shown as clickable cards
- Personalised welcome message using the stored user's first name
- Skeleton loading states while data is fetching

**Results**
- Displays the full AI output: Summary, Key Points, Action Items, Knowledge Check (quiz)
- Copy-to-clipboard on the summary section
- Action item checkboxes with strikethrough on completion
- Quiz questions rendered as accordions with a hidden reveal-answer step
- Works for both freshly generated summaries and notes opened from History

**History**
- Full list of the authenticated user's summaries, newest first
- Client-side search filtering against summary text and key points
- Loading skeleton while the list is fetching
- Click any card to load the full note and navigate to the Results page

**Profile**
- Fetches real user data from the backend (name, email, join date)
- Real stats (same data as Dashboard stats cards)
- Up to 4 most recent notes shown as a clickable activity list
- Inline name editing — click the name to edit, press Enter or Save to persist, Escape to cancel
- Logout confirmation modal

**Settings**
- Appearance toggles (Dark Mode — UI only, not persisted)
- Notification toggles (Email Notifications, Push Notifications — UI only, not persisted)
- Delete Account — calls the backend, clears auth storage, redirects to the landing page with a success banner

**Landing Page**
- Public marketing page with features, how-it-works, and pricing sections
- Displays a success banner when redirected after account deletion

**Not yet implemented** (UI elements present but non-functional):
- Google / OAuth login (button is disabled)
- PDF download on the Key Points section (button is visible but wired to no action)
- Flashcard creation (button is visible but wired to no action)
- Audio playback panel (static UI)
- Share and Export Insights buttons on the Results page
- Dark mode persistence
- Notification preferences persistence
- Forgot password / password reset
- Email verification

---

## Tech Stack

| Package | Version | Purpose |
|---|---|---|
| `react` | ^18.3.1 | UI library |
| `react-dom` | ^18.3.1 | DOM rendering |
| `react-router-dom` | ^7.18.1 | Client-side routing |
| `axios` | ^1.18.1 | HTTP client |
| `tailwindcss` | ^4.3.2 | Utility-first CSS |
| `@tailwindcss/vite` | ^4.3.2 | Tailwind Vite plugin |
| `vite` | ^5.4.2 | Build tool and dev server |
| `@vitejs/plugin-react` | ^4.3.1 | React fast refresh |
| `eslint` | ^9.9.1 | Linting |

---

## Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- The NoteLoom AI backend running and accessible (see [API Dependency](#api-dependency))

---

## Installation

```bash
# From the project root
cd NoteLoomFrontend

npm install
```

---

## Environment Variables

Create a `.env` file in the `NoteLoomFrontend` directory by copying the example:

```bash
cp .env.example .env
```

`.env.example`:

```env
# Backend API base URL — no trailing slash, no /api suffix
VITE_API_URL=http://localhost:5000
```

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Base URL of the Express backend. Vite injects this at build time via `import.meta.env.VITE_API_URL`. Do not add a trailing slash or `/api`. |

> **Important:** Vite only exposes environment variables prefixed with `VITE_` to the browser. Variables without this prefix are not available in frontend code.

---

## Running Locally

Start the backend first (see the backend README), then:

```bash
cd NoteLoomFrontend
npm run dev
```

The dev server starts at `http://localhost:5173` by default.

Make sure `VITE_API_URL` in `.env` points to the running backend (`http://localhost:5000` by default).

---

## Project Structure

```
NoteLoomFrontend/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── AppLayout.jsx       # Shared app shell (sidebar + header)
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Footer.jsx
│   │   ├── HistoryCard.jsx     # Summary preview card used in Dashboard + History
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── Navbar.jsx          # Landing page navigation
│   │   ├── ProfileCard.jsx     # User card with inline name editing
│   │   ├── PrivateRoute.jsx    # Redirects unauthenticated users to /login
│   │   ├── PublicRoute.jsx     # Redirects authenticated users to /dashboard
│   │   ├── Sidebar.jsx
│   │   ├── SummaryCard.jsx
│   │   └── Textarea.jsx
│   ├── data/
│   │   └── mockData.js         # Static data for landing page stats and pricing only
│   ├── hooks/
│   │   └── useLogout.js        # Calls backend logout, clears storage, redirects
│   ├── icons/
│   │   └── index.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx       # Main app page — transcript input + stats + recent notes
│   │   ├── History.jsx         # Searchable list of all user summaries
│   │   ├── Landing.jsx         # Public marketing page
│   │   ├── Login.jsx           # Email/password login form
│   │   ├── Profile.jsx         # User profile with stats and recent activity
│   │   ├── Results.jsx         # Full AI output display
│   │   ├── Settings.jsx        # App preferences and account deletion
│   │   ├── SignUp.jsx          # Registration form
│   │   └── TermsPlaceholder.jsx # Coming-soon placeholder for /terms and /privacy
│   ├── services/
│   │   └── api.js              # All axios calls, single axios instance
│   ├── utils/
│   │   └── auth.js             # isAuthenticated, getStoredUser, clearAuthStorage, updateStoredUser
│   ├── App.jsx                 # Route definitions
│   ├── index.css
│   └── main.jsx
├── .env.example
├── eslint.config.js
├── index.html
├── package.json
├── vercel.json
└── vite.config.js
```

---

## Available Scripts

All scripts run from the `NoteLoomFrontend` directory.

| Script | Command | Description |
|---|---|---|
| Development server | `npm run dev` | Starts Vite dev server with HMR at `http://localhost:5173` |
| Production build | `npm run build` | Outputs optimised static files to `dist/` |
| Preview build | `npm run preview` | Serves the `dist/` folder locally to verify the production build |
| Lint | `npm run lint` | Runs ESLint across all source files |

---

## API Dependency

This frontend requires the NoteLoom AI Express backend to be running. All requests are sent to `VITE_API_URL/api/...`.

**Endpoints consumed by the frontend:**

| Method | Path | Auth | Used by |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | SignUp page |
| `POST` | `/api/auth/login` | Public | Login page |
| `POST` | `/api/auth/logout` | Public | useLogout hook |
| `GET` | `/api/users/profile` | Private | Profile page |
| `PUT` | `/api/users/profile` | Private | Profile page (name edit) |
| `DELETE` | `/api/users/profile` | Private | Settings page (delete account) |
| `POST` | `/api/summarize` | Private | Dashboard page |
| `GET` | `/api/history` | Private | Dashboard, History, Profile pages |
| `GET` | `/api/history/:id` | Private | History page, Profile page |
| `GET` | `/api/notes/stats` | Private | Dashboard page, Profile page |

**Authentication sent with every request:**
- `Authorization: Bearer <token>` header (from `localStorage.authToken`) — added by an axios request interceptor
- HttpOnly cookie `token` — sent automatically by the browser when `withCredentials: true` is set on the axios instance

The backend accepts whichever credential arrives first.

---

## Authentication Flow

**Sign Up**
1. User fills in name, email, password, and checks the Terms & Privacy checkbox
2. Frontend validates all fields before sending the request
3. `POST /api/auth/register` is called with `{ name, email, password, acceptedTerms: true }`
4. Backend creates the user, hashes the password, sets an HttpOnly JWT cookie, and returns `{ _id, name, email, createdAt, token }`
5. Frontend stores `{ _id, name, email }` as `localStorage.user` and the token as `localStorage.authToken`
6. User is redirected to `/dashboard`

**Log In**
1. User submits email and password
2. Frontend validates fields before sending the request
3. `POST /api/auth/login` is called
4. On success, same storage and redirect as Sign Up
5. If the user was redirected to `/login` from a protected page, they are sent back to that page after login

**Authentication persistence**
The session is stored in `localStorage` and survives page refreshes. `isAuthenticated()` in `src/utils/auth.js` checks that both `localStorage.authToken` and a valid `localStorage.user` object are present. This check runs synchronously on every route render — no async call is needed.

**Log Out**
1. `POST /api/auth/logout` clears the HttpOnly cookie on the server
2. `clearAuthStorage()` removes `authToken` and `user` from `localStorage`
3. User is redirected to `/`

**Delete Account**
1. `DELETE /api/users/profile` deletes the user and all their notes from MongoDB
2. Server clears the HttpOnly cookie
3. Frontend clears `localStorage` and redirects to `/` with a success message in navigation state
4. The landing page reads `location.state.accountDeleted` and displays a green banner

---

## Routes

### Public (no authentication required)

| Path | Component | Description |
|---|---|---|
| `/` | `Landing` | Marketing landing page |
| `/terms` | `TermsPlaceholder` | Terms of Service placeholder |
| `/privacy` | `TermsPlaceholder` | Privacy Policy placeholder |

### Public-only (redirects to `/dashboard` if already authenticated)

| Path | Component | Description |
|---|---|---|
| `/login` | `Login` | Email/password login |
| `/signup` | `SignUp` | Registration with Terms agreement |

### Private (redirects to `/login` if not authenticated)

| Path | Component | Description |
|---|---|---|
| `/dashboard` | `Dashboard` | Transcript input, stats, recent notes |
| `/results` | `Results` | Full AI output for a generated or loaded summary |
| `/history` | `History` | Searchable list of all user summaries |
| `/profile` | `Profile` | User info, stats, recent activity, logout |
| `/settings` | `Settings` | Appearance/notification toggles, delete account |

Route guards are implemented as wrapper components (`PrivateRoute`, `PublicRoute`) in `src/components/`. They read `isAuthenticated()` synchronously on every render and issue a `<Navigate>` redirect with `replace` so the protected route never appears in browser history.

---

## Deployment

**Vercel (frontend)**

`vercel.json` is already configured in this directory:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This rewrite rule ensures that all paths are served by `index.html`, which is required for client-side routing with React Router. Without it, direct URL access and browser refreshes on non-root paths return a 404.

**Deployment steps:**
1. Connect the `NoteLoomFrontend` directory to a Vercel project
2. Set the build command to `npm run build` and the output directory to `dist`
3. Add the environment variable `VITE_API_URL` in the Vercel project settings, pointing to the deployed backend URL (e.g. `https://your-backend.onrender.com`)
4. Deploy — Vercel will automatically rebuild on every push to the connected branch

> The `VITE_API_URL` environment variable must be set in Vercel's project settings, not committed to the repository. Vite bakes environment variables into the bundle at build time, so the correct URL must be available during the Vercel build.
