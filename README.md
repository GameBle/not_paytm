# PayTM Clone — Production-Hardened Full-Stack Wallet App

> **Live Demo:** [https://not-paytm.vercel.app](https://not-paytm.vercel.app)

A peer-to-peer money transfer application built with **React**, **TypeScript**, **Node.js**, **Express**, and **MongoDB**. This project takes the common tutorial PayTM clone and hardens it for production: refresh-token auth, email verification, transaction ledger, real-time notifications, admin panel, bcrypt password hashing, transactional transfers, layered backend architecture, integration tests, CI/CD, and Docker support.

[![CI](https://github.com/GameBle/not_paytm/actions/workflows/ci.yml/badge.svg)](https://github.com/GameBle/not_paytm/actions/workflows/ci.yml)

## Why this project

Most bootcamp submissions ship the same PayTM clone with plaintext passwords and no tests. This version demonstrates **engineering maturity** suitable for SDE interviews:

- Security-first auth (bcrypt, refresh tokens, helmet, rate limiting, env-based secrets)
- **Email verification** and **password reset** via Resend
- MongoDB **multi-document transactions** for money transfers with **transaction ledger**
- **Socket.IO** real-time notifications on transfers
- **Admin panel** with user/transaction stats
- **TypeScript** end-to-end with Zod validation
- **Jest + Supertest** integration tests on critical money paths
- **GitHub Actions** CI pipeline
- **Docker Compose** for one-command local setup

## Architecture

```mermaid
flowchart TB
  subgraph frontend [Frontend - React + Vite]
    UI[Pages and Components]
    API[Axios Client + Silent Refresh]
    Socket[Socket.IO Client]
    UI --> API
    UI --> Socket
  end

  subgraph backend [Backend - Express + TypeScript]
    Routes[Routes]
    Controllers[Controllers]
    Services[Services]
    Models[Mongoose Models]
    IO[Socket.IO Server]
    Routes --> Controllers --> Services --> Models
    Services --> IO
  end

  DB[(MongoDB)]
  Mailer[Resend Email]

  API -->|REST /api/v1| Routes
  Socket -->|WebSocket| IO
  Services --> Mailer
  Models --> DB
```

### Backend layers

| Layer | Responsibility |
|-------|----------------|
| `routes/` | HTTP routing, middleware attachment |
| `controllers/` | Request parsing, response formatting |
| `services/` | Business logic (auth, transfers) |
| `models/` | Mongoose schemas |
| `schemas/` | Zod validation (single source of truth) |

## Tech stack

| Area | Choices |
|------|---------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express, TypeScript, Mongoose, Zod |
| Auth | Access token (15m) + refresh token (httpOnly cookie), bcrypt (10 rounds) |
| Email | Resend (verification + password reset) |
| Realtime | Socket.IO per-user rooms |
| Testing | Jest + Supertest + mongodb-memory-server; Vitest + RTL |
| DevOps | GitHub Actions, Docker, Docker Compose |

## Getting started

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)

### Local development

**1. Backend**

```bash
cd backend
cp .env.example .env   # edit MONGO_URL and JWT_SECRET
npm install
npm run dev
```

**2. Frontend**

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`.

### Docker Compose

```bash
# Set a strong JWT_SECRET in your shell or .env at repo root
docker compose up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Health check: `GET http://localhost:3000/health`

## Environment variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `MONGO_URL` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs (min 16 chars) |
| `PORT` | Server port (default 3000) |
| `FRONTEND_URL` | CORS origin (default `http://localhost:5173`) |
| `RESEND_API_KEY` | Resend API key (optional in dev — links logged to console) |
| `EMAIL_FROM` | Sender address for transactional email |
| `ACCESS_TOKEN_TTL` | Access token lifetime (default `15m`) |
| `REFRESH_TOKEN_TTL` | Refresh token lifetime (default `7d`) |
| `REFRESH_TOKEN_TTL_REMEMBER` | Remember-me refresh TTL (default `30d`) |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |

## API reference

Base URL: `/api/v1`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/user/signup` | No | Register user + create wallet + send verification email |
| POST | `/user/signin` | No | Login, returns access token + refresh cookie |
| GET | `/user/me` | Yes | Current user profile (role, emailVerified) |
| PUT | `/user/` | Yes | Update profile / change password |
| GET | `/user/bulk?filter=` | No | Search users by name |
| POST | `/auth/refresh` | Cookie | Rotate refresh token, issue new access token |
| POST | `/auth/logout` | Cookie | Revoke refresh token |
| POST | `/auth/verify-email` | No | Verify email with token |
| POST | `/auth/resend-verification` | No | Resend verification email |
| POST | `/auth/forgot-password` | No | Send password reset email |
| POST | `/auth/reset-password` | No | Reset password with token |
| GET | `/account/balance` | Yes | Get wallet balance |
| POST | `/account/transfer` | Yes | Transfer funds (transactional + ledger) |
| GET | `/transactions` | Yes | Paginated transaction history |
| GET | `/transactions/:id` | Yes | Transaction receipt |
| GET | `/notifications` | Yes | List notifications |
| POST | `/notifications/:id/read` | Yes | Mark notification read |
| POST | `/notifications/read-all` | Yes | Mark all notifications read |
| GET | `/admin/stats` | Admin | Platform statistics |
| GET | `/admin/users` | Admin | Paginated user list with balances |
| GET | `/admin/transactions` | Admin | All transactions |

### Promote admin

```bash
cd backend
npm run promote-admin -- admin@example.com
```

## Testing

```bash
# Backend integration tests
cd backend && npm test

# Frontend unit tests
cd frontend && npm test

# Type checking
cd backend && npm run typecheck
cd frontend && npm run typecheck
```

## Deployment

### Recommended stack

1. **MongoDB Atlas** — free tier cluster
2. **Render / Railway / Fly.io** — backend (`npm run build && npm start`)
3. **Vercel / Netlify** — frontend (`npm run build`)

Set `VITE_API_URL` to your deployed backend URL at build time. Set `FRONTEND_URL` on the backend for CORS.

## Design decisions and trade-offs

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| JWT access + refresh cookie | Short-lived access token; refresh in httpOnly cookie | Cross-domain deploy needs `sameSite=None; Secure` |
| MongoDB transactions | Atomic transfers prevent partial debits | Requires replica set (Atlas provides this) |
| Zod schemas | Shared validation + type inference | Slight boilerplate vs plain validators |
| Layered backend | Clear separation for testing and growth | More files than a tutorial monolith |
| bcrypt (10 rounds) | Industry-standard password hashing | Slower than plain compare (intentional) |

## Resume bullet examples

- Built production-grade P2P wallet: refresh-token auth, email verification, transaction ledger, Socket.IO notifications, and admin panel
- Hardened a full-stack P2P wallet app: bcrypt auth, rate limiting, and MongoDB transactional transfers with audit trail
- Migrated MERN tutorial codebase to **TypeScript** with layered architecture (routes → controllers → services)
- Wrote **integration tests** for auth, transfers, transactions, notifications, and admin authorization
- Set up **GitHub Actions CI** and **Docker Compose** for reproducible builds and deployment

## License

ISC
