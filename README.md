# WorkX

WorkX is a personal learning logbook. It helps learners capture study sessions, organize topics and subtopics, and track the time invested in learning.

This repository now contains a separated Next.js frontend and Express API on the default branch. The original EJS implementation is retained in the repository as a reference; the new deployment uses `frontend/` and `backend/`.

## Project structure

```
backend/   Express 5 REST API, Passport local auth, MongoDB, Brevo OTP
frontend/  Next.js App Router interface
```

## Features

- Email OTP verification before account creation (10-minute expiry)
- Username availability endpoint
- Login, logout and persistent MongoDB-backed sessions
- Personal learning logs
- Multiple topics and subtopics per log
- Per-topic hours and minutes
- Create, edit and delete learning logs
- Delete topics and subtopics through the API
- Owner-scoped database queries for every log mutation

## Local development

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
``

Set valid MongoDB and Brevo credentials in `backend/.env`.

### 2. Frontend

In another terminal:

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
``

Open http://localhost:3000. Next.js rewrites `/api/*` to the Express server, keeping browser requests same-origin and avoiding cross-site session-cookie restrictions.

## Deploy

### Render — backend

- Create a **Web Service** from this repository.
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Add `MONGO_URL`, `SESSION_SECRET`, `OTP_SECRET`, `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `CLIENT_URL`, and `NODE_ENV=production`.
- Set `CLIENT_URL` to the Vercel frontend origin (or comma-separated origins if needed).

### Vercel — frontend

- Import the same repository.
- Root directory: `frontend`
- Framework preset: Next.js
- Add `API_SERVER_URL=https://YOUR-RENDER-SERVICE.onrender.com`
- Deploy.

The frontend proxies API traffic through Next.js rewrites. This keeps session cookies first-party in the browser even though the Express API runs on Render. Do not expose the API origin as a client-side public environment variable.

## Security notes

- Never commit real `.env` files or credentials.
- Use long, unique random values for session and OTP HMAC secrets.
- Production session cookies are HttpOnly, Secure and SameSite=None; Render proxy trust is enabled.
- CORS uses an explicit origin allowlist for direct API requests.
- Authentication and OTP endpoints are rate-limited.
- OTP values are HMAC-digested before storage and compared with timing-safe equality.
- Log reads, updates and deletes always include the authenticated owner ID.
- HTTPS is required in production.

For production hardening, configure a custom domain strategy and monitor rate limits and email provider quotas. Add automated integration tests before opening registration to the public.
