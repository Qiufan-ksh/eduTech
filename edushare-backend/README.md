# EduShare authentication backend

This Node.js/Express service stores user accounts in PostgreSQL and serves the EduShare page from the configured HTML file. Authentication uses bcrypt password hashes and JWTs in an HttpOnly, SameSite=Strict cookie.

## Requirements

- Node.js 20 or later
- PostgreSQL 14 or later, with an empty `edushare` database created

## Setup

From this directory:

```powershell
npm install
Copy-Item .env.example .env
```

Edit `.env` and set `DATABASE_URL`, a private random `JWT_SECRET` of at least 32 characters, and `FRONTEND_FILE` to the absolute path of `osoa.html`. The `.env` file is ignored by Git. Generate a JWT secret with:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Create the database in PostgreSQL if it does not already exist:

```sql
CREATE DATABASE edushare;
```

The service creates the `users` table on startup. Start the service:

```powershell
npm start
```

Open `http://localhost:3000` (or the configured port). Do not open the HTML directly as a `file://` URL; the page must use the backend origin for its session cookie and API requests.

## Authentication API

- `POST /api/auth/register` — JSON `{ "displayName": "Student", "email": "student@example.com", "password": "at-least-8-chars" }`; creates an account and starts a session.
- `POST /api/auth/login` — JSON `{ "email": "student@example.com", "password": "..." }`; starts a session.
- `GET /api/auth/me` — returns the signed-in user or `401`.
- `POST /api/auth/logout` — clears the session cookie.
- `GET /api/health` — checks the database connection.

Passwords are never returned by the API. Registration and login are rate limited. In production, serve over HTTPS so the session cookie is Secure.

## Tests

Run the test suite with:

```powershell
npm test
```

The API tests use an in-memory user model and do not require a running PostgreSQL server.
