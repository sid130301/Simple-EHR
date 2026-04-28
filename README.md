# HealthNest EHR

A full-stack Electronic Health Record application built as a modern monorepo:

- `apps/api`: Express, Prisma, PostgreSQL, JWT auth, Firebase Google OAuth verification
- `apps/web`: Next.js, React, Tailwind CSS, protected dashboard UI
- `packages/shared`: shared Zod validation schemas and TypeScript types

The existing root desktop/static EHR files are left intact. This full-stack implementation lives alongside them in `apps/` and `packages/`.

## Features

- Email/password signup and login with bcrypt password hashing
- Google OAuth login through Firebase ID tokens
- JWT-protected API with role-based access for `DOCTOR`, `NURSE`, and `ADMIN`
- Responsive health-tech dashboard with sidebar navigation
- Patient CRUD with search, filters, pagination, and PDF export
- OPD visit creation, history, prescriptions, diagnosis, and follow-up scheduling
- Emergency quick registration, triage, and status updates
- Audit logs for sensitive reads and writes
- Zod input validation, centralized error handling, request sanitization
- Dark mode, loading states, error states, and toast notifications

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 15+ or Docker
- Firebase project if you want Google OAuth enabled

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start PostgreSQL:

   ```bash
   docker compose up -d
   ```

3. Create environment files:

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env.local
   ```

4. Generate Prisma client and run migrations:

   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

5. Run the app:

   ```bash
   npm run dev
   ```

The API runs on `http://localhost:4000` and the web app runs on `http://localhost:3000`.

## Demo Accounts

After seeding:

- Admin: `admin@healthnest.test` / `Password123!`
- Doctor: `doctor@healthnest.test` / `Password123!`
- Nurse: `nurse@healthnest.test` / `Password123!`

## Google OAuth With Firebase

Create a Firebase web app and enable Google sign-in. Put the client config in `apps/web/.env.local`. For the API, create a Firebase service account and copy its project ID, client email, and private key into `apps/api/.env`.

## API Overview

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `GET /api/auth/me`
- `GET /api/dashboard/stats`
- `GET /api/patients`
- `POST /api/patients`
- `GET /api/patients/:id`
- `PUT /api/patients/:id`
- `DELETE /api/patients/:id`
- `GET /api/patients/:id/opd-history`
- `GET /api/patients/:id/export/pdf`
- `GET /api/opd`
- `POST /api/opd`
- `GET /api/emergency`
- `POST /api/emergency`
- `PATCH /api/emergency/:id/status`
- `GET /api/audit`
