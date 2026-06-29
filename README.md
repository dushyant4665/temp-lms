# Assignment

Full-stack course platform built with an Express + Prisma backend and a Next.js frontend.

## Stack

- Next.js App Router
- Tailwind CSS
- shadcn/ui-style primitives
- Node.js + Express
- Prisma + PostgreSQL
- Email OTP auth with httpOnly cookie sessions

## Repo Layout

- `backend/` - Express API, Prisma schema, auth, course, and dashboard logic
- `frontend/` - Next.js UI, server-rendered course pages, protected dashboard, and lesson viewer

## Setup

1. Clone the repository.
2. Copy the env files:
   - `backend/.env.example` to `backend/.env`
   - `frontend/.env.example` to `frontend/.env.local`
3. Set `DATABASE_URL` to a PostgreSQL database.
4. Install dependencies from the repository root:
   - `npm install`
5. Run Prisma:
   - `npm run seed`
   - or from `backend/`: `npx prisma generate` and `npx prisma db push`
6. Start both apps:
   - Backend: `npm run dev:backend`
   - Frontend: `npm run dev:frontend`

## Environment Variables

Backend:

- `DATABASE_URL`
- `JWT_SECRET`
- `AUTH_COOKIE_NAME`
- `FRONTEND_URL`
- `MOCK_OTP` - optional, keeps OTP deterministic for the take-home
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

If SMTP is set, the OTP is emailed.
If SMTP is not set, the backend still works in dev mode and returns `devOtp`.

Frontend:

- `NEXT_PUBLIC_BACKEND_URL`

## What Works

- Email OTP login
- Cookie-based session auth
- `/dashboard` protection in Next.js middleware
- Public course catalogue
- Server-rendered course detail pages
- Enroll flow from the course page
- Auth-protected lesson viewer
- Lesson completion persisted via Prisma
- Dashboard progress overview

## Notes

- OTP delivery is mocked on purpose so the flow stays self-contained. The backend returns a `devOtp` value during login setup.
- Lesson completion is stored as a relational record (`LessonCompletion`) instead of a frontend flag.
- Arcjet and Stripe are not integrated in code here, but the backend is structured so they can be added cleanly later.

## Known Limitations

- No production email provider is wired up.
- Stripe checkout/webhooks are left as an optional extension.
- The frontend shadcn/ui pieces are scaffolded locally to keep the repo self-contained.
