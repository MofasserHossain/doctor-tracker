# Doctor Tracker

Doctor Tracker is a secure admin application for Care Guide BD to manage doctors, their patients, and operational care metrics. It is built as two standalone applications: a Next.js frontend for the admin dashboard and an Express REST API backed by MongoDB/Mongoose.

## Submission Links

Fill these in after deployment:

```text
Frontend GitHub repository:
Backend GitHub repository:
Live frontend URL:
Live backend API URL:
```

If this repository is submitted as a monorepo, the frontend source is in `frontend/` and the backend source is in `backend/`.

## Features

- Admin authentication with JWT bearer/cookie support.
- Doctor CRUD with search, filter, and cursor pagination.
- Patient CRUD with doctor assignment, patient filtering, search, and cursor pagination.
- Doctor detail API for listing patients under a selected doctor.
- Dashboard summary API with totals, patients per doctor, condition distribution, and date-based statistics.
- Responsive admin UI built with Next.js, shadcn UI primitives, TanStack Query, React Hook Form, Zod, Recharts, and lucide icons.
- Code quality tooling with `oxlint`, `oxfmt`, and `knip`.

## Project Structure

```text
.
├── frontend/      # Next.js admin UI
├── backend/       # Express REST API with MongoDB/Mongoose
├── devservice/    # Local Docker Compose files
├── docs/          # Submission screenshots and supporting documentation assets
```

Each application also has its own README:

```text
frontend/README.md
backend/README.md
```

## Setup Guide

### Prerequisites

- Node.js `20.19.0` or newer.
- npm `10` or newer.
- Docker Desktop for local MongoDB.

### 1. Install Dependencies

```bash
npm --prefix frontend install
npm --prefix backend install
```

This repository intentionally does not use a root `package.json`. Run npm scripts through the
individual app folders with `npm --prefix frontend ...` or `npm --prefix backend ...`.

### 2. Configure Environment Files

Create the frontend env file:

```bash
cp frontend/.env.example frontend/.env.local
```

`frontend/.env.example`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

Create the backend env file:

```bash
cp backend/.env.example backend/.env.dev
```

`backend/.env.example`

```env
NODE_ENV=development
HOST=localhost
PORT=4000
CORS_ORIGIN=http://localhost:3000
MONGODB_URI=mongodb://doctor_tracker:doctor_tracker_password@127.0.0.1:27017/doctor_tracker?authSource=admin
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters
JWT_ACCESS_EXPIRATION_MINUTES=1440
COOKIE_DOMAIN=
COOKIE_SAME_SITE=lax
BCRYPT_SALT_ROUNDS=12
AUTH_RATE_LIMIT_MAX=30
AUTH_RATE_LIMIT_WINDOW_MS=900000
API_RATE_LIMIT_MAX=300
API_RATE_LIMIT_WINDOW_MS=900000
```

### 3. Start MongoDB

```bash
docker compose -f devservice/docker-compose.local.yml up -d
```

### 4. Seed Demo Data

```bash
npm --prefix backend run db:seed
```

Seed credentials:

```text
Email: admin@doctortracker.local
Password: Admin@12345
```

### 5. Run The Backend

```bash
npm --prefix backend run dev
```

Backend API:

```text
http://localhost:4000/api/v1
```

### 6. Run The Frontend

In a second terminal:

```bash
npm --prefix frontend run dev
```

Frontend app:

```text
http://localhost:3000
```

## API Overview

All protected routes require an authenticated admin.

```text
GET    /api/v1/health-check
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
GET    /api/v1/dashboard/summary
GET    /api/v1/doctors
POST   /api/v1/doctors
GET    /api/v1/doctors/:id
PATCH  /api/v1/doctors/:id
DELETE /api/v1/doctors/:id
GET    /api/v1/doctors/:id/patients
POST   /api/v1/doctors/:id/patients
DELETE /api/v1/doctors/:doctorId/patients/:patientId
GET    /api/v1/patients
POST   /api/v1/patients
GET    /api/v1/patients/:id
PATCH  /api/v1/patients/:id
DELETE /api/v1/patients/:id
```

## System Architecture

```mermaid
flowchart LR
  Admin[Admin user] --> UI[Next.js frontend]
  UI --> Query[TanStack Query + Axios API client]
  Query --> API[Express REST API]
  API --> Auth[Auth middleware + Zod validation]
  Auth --> Services[Doctor, Patient, Dashboard services]
  Services --> Models[Mongoose models]
  Models --> Mongo[(MongoDB)]
```

The frontend owns the admin experience, routing, forms, table screens, dashboard charts, and client-side API calls. The backend owns authentication, validation, database access, business rules, and response formatting. MongoDB stores users, doctors, and patients, while dashboard metrics are produced through aggregation queries in the API.

## Technical Decisions

### 1. Separate frontend and backend applications

The assignment asks for independent frontend and backend deliverables, so the implementation keeps Next.js and Express as separate applications even though they live in one monorepo. This keeps deployment flexible: the frontend can be deployed to Vercel or Netlify, while the backend can be deployed to Render, Vercel serverless functions, or a VPS. It also keeps the REST API usable from the interview environment, Postman, or any future client without coupling it to Next.js route handlers.

### 2. Service-layer querying with Mongoose indexes

Doctor and patient search/filter/cursor-pagination behavior is handled in backend service modules instead of being spread across controllers. The Mongoose schemas define text and compound indexes for common access paths such as doctor specialization, hospital, patient condition, doctor-patient lookups, and date filtering. List endpoints use a MongoDB ObjectId cursor with `limit + 1` fetching so the API can return a `nextCursor` without leaking the extra sentinel row to the UI.

## Visual Evidence

Desktop dashboard:

![Desktop dashboard](docs/screenshots/dashboard-desktop.png)

Mobile dashboard:

![Mobile dashboard](docs/screenshots/dashboard-mobile.png)

## Quality Checks

Run all configured static checks:

```bash
npm --prefix frontend run analyze
npm --prefix backend run analyze
```

Run automated tests:

```bash
npm --prefix frontend run test
npm --prefix backend run test
```

Run production builds:

```bash
npm --prefix frontend run build
npm --prefix backend run build
```

The repository uses `oxlint` for linting, `oxfmt` for formatting, and `knip` for dead-code checks in both applications.

## Deployment Notes

- Frontend: set `NEXT_PUBLIC_API_URL` to the deployed backend API origin plus `/api/v1`.
- Backend: set `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, and `CORS_ORIGIN` for the deployed frontend origin.
- Auth cookies are `HttpOnly`. For different root domains, use HTTPS and set `COOKIE_SAME_SITE=none`; for same-site subdomains, `COOKIE_SAME_SITE=lax` is preferred. Set `COOKIE_DOMAIN` only when sharing a cookie across subdomains of the same parent domain.
- Seed the first admin user before submitting or create an equivalent production admin account.
