# WorkX architecture and operations

## Application boundaries

- `frontend/app` contains Next.js routes and route-level loading/error boundaries.
- `frontend/app/[username]` is the authenticated user workspace route segment.
- `frontend/src/components` contains reusable workspace UI and providers.
- `frontend/src/lib/api.ts` is the only low-level browser HTTP client.
- `frontend/src/lib/services` contains feature-oriented API/data-access modules.
- `backend/app.js` defines API routes, authentication, authorization and centralized errors.
- `backend/models` owns persisted data schemas.

## Authentication lifecycle

- Passport Local authenticates credentials.
- Express sessions are persisted in MongoDB through connect-mongo.
- Session cookies are HttpOnly, Secure in production, SameSite=Lax, rolling, and expire after seven days.
- Login/signup wait for the Passport session to be saved before returning success.
- The frontend AuthProvider loads the current session once and exposes refresh/sign-out methods.
- A 401 API response invalidates the shared frontend auth state.
- Logout destroys the server session and clears the session cookie.

## Workspace route protection

- Workspace URLs use `/:username`, `/:username/dashboard`, `/:username/account`, `/:username/productivity`, and nested log routes.
- Next middleware validates the session against `GET /api/auth/me` before serving a username workspace.
- Unauthenticated requests redirect to `/login`.
- A mismatched username redirects to the authenticated user's canonical workspace path.
- The client workspace layout provides a second session/username check.
- API authorization remains authoritative; a URL username is never used to select a database owner.

## Data ownership

- Every learning-log query is scoped by `req.user._id`.
- Productivity workspace reads/writes are scoped by `req.user._id`.
- Never accept an owner/user ID from a browser request to select another user's records.
- New collections must include an owner reference and use authenticated owner-scoped queries.

## Role-based access control

- Roles are derived from the persisted User `isAdmin` field and exposed as `admin` or `user`.
- Admin endpoints use server-side `requireRole("admin")`; hiding frontend links is not authorization.
- Admin endpoints currently include overview, paginated user listing and role updates.
- The last administrator cannot be demoted.
- Users cannot set their own role through signup, profile, or username endpoints.

### Provision the first administrator

There is intentionally no public admin bootstrap endpoint. Promote the first trusted account directly in MongoDB Atlas after verifying its email and username:

```javascript
db.users.updateOne(
  { username: "YOUR_TRUSTED_USERNAME" },
  { $set: { isAdmin: true } }
)
```

Confirm the collection name in Atlas if your Mongoose collection was customized. Thereafter, existing admins can manage roles through the protected admin API. Never expose database credentials in the frontend.

## API and error handling

- Browser requests should use `api.ts` and a feature service in `src/lib/services`.
- The API wrapper disables caching, uses same-origin credentials and normalizes non-2xx responses into `ApiError`.
- API responses use stable error codes such as `UNAUTHENTICATED`, `FORBIDDEN`, and `INTERNAL_ERROR`.
- Next route segments provide loading and error boundaries; feature pages provide retryable error messages.
- User-specific responses should use `Cache-Control: no-store`.

## Required production configuration

Frontend (Vercel):
- `API_SERVER_URL=https://workx-yot1.onrender.com`

Backend (Render):
- `NODE_ENV=production`
- `CLIENT_URL=https://workx-ianamikasingh.vercel.app`
- `MONGO_URL`
- `SESSION_SECRET`
- `BREVO_API_KEY`
- `BREVO_SENDER_EMAIL`

Keep secrets only in the deployment environment, never in Git.

## Verification checklist

1. Anonymous visitor opens `/someuser/dashboard` and is redirected to login.
2. User A opens `/userB/productivity` and is redirected to `/userA/productivity`.
3. User A cannot read, update or delete User B's logs by changing an ID.
4. User A cannot access `/api/admin/*` (403).
5. An admin can view paginated users and update roles.
6. The last admin cannot be demoted.
7. Logging out invalidates the session and protected routes redirect to login.
8. Changing username updates the session identity and redirects to the new canonical URL.
9. Temporary backend unavailability returns a 503 from route middleware rather than falsely logging the user out.
10. Production build and end-to-end smoke tests pass before considering the rollout complete.
