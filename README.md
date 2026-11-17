# WorkX

WorkX is a personal learning and productivity workspace. It helps learners record study sessions, organize topics and subtopics, track time, and manage learning goals, tasks, notes, bookmarks, and flashcards.

## Repository structure

```text
WorkX/
├── frontend/          Next.js application (deployed on Vercel)
├── backend/           Express API and MongoDB models (deployed on Render)
├── docs/              Architecture and maintenance documentation
├── index.js           Render startup entry point
├── package.json       Root runtime dependencies and Render scripts
├── package-lock.json  Locked root dependencies used by Render
├── .gitignore
└── README.md
```

The previous EJS application and its root-level models, routes, utilities, static assets, views, and sample seed script have been removed. The active frontend and backend are maintained separately in `frontend/` and `backend/`.

## Features

- Email OTP verification before account creation
- Login, logout, and persistent MongoDB-backed sessions
- Username availability checks and username changes
- User-scoped learning logs with topics, subtopics, and time tracking
- Productivity workspace with goals, tasks, notes, bookmarks, and flashcards
- Password recovery and account deletion
- Role-protected administrative API endpoints
- Owner-scoped database access

## Local development

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Configure MongoDB and Brevo credentials in `backend/.env`.

### Frontend

In a separate terminal:

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`. The Next.js application proxies `/api/*` requests to the Express API so browser session cookies remain same-origin.

## Deployment

### Render — backend

The existing Render service uses the repository root as its root directory and starts the API through the root `index.js`, which imports `backend/server.js`.

- Root directory: repository root (leave blank)
- Build command: `npm install`
- Start command: `npm start`
- Required environment variables: `MONGO_URL`, `SESSION_SECRET`, `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `CLIENT_URL`, and `NODE_ENV=production`
- Optional: `OTP_SECRET` (falls back to `SESSION_SECRET`)

Do not delete or move the root `index.js`, `package.json`, or `package-lock.json` without updating the Render service configuration.

### Vercel — frontend

- Root directory: `frontend`
- Framework: Next.js
- Environment variable: `API_SERVER_URL` set to the Render API origin

Do not expose the backend origin as a client-side public environment variable.

## Security

- Never commit real `.env` files, API keys, database credentials, or session secrets.
- Production session cookies are HttpOnly, Secure, and SameSite=Lax.
- CORS uses the configured frontend origin allowlist.
- Authentication and OTP endpoints are rate-limited.
- OTP values are HMAC-digested before storage.
- Learning-log reads and mutations are scoped to the authenticated owner.
- Admin actions are enforced by backend role checks.
