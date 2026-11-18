# Job Application Tracker

A full-stack web app for tracking job applications, interview stages and
follow-ups.

**Status:** 🚧 In development (Week 1: planning)

## Why I'm building this
Applying for internships means juggling dozens of applications across
different sites. This tracker keeps everything in one place.

## Planned features
- Create, edit and delete applications
- Status pipeline with history
- Search, filter and dashboard
- Interviews and follow-up reminders
- User accounts

## Tech stack
React + TypeScript · Node.js + Express · PostgreSQL

## Documentation
See [docs/SCOPE.md](docs/SCOPE.md)

## Running locally

1. Create the database and run `server/db/schema.sql`
2. Optional sample data: run `server/db/seed.sql`
3. `cd server && cp .env.example .env`, then set your database password
4. `npm install`
5. `npm run dev`
6. Visit http://localhost:3000/health/db

## Roadmap
- [x] Week 1: Project scope and repository setup
- [ ] Weeks 2–5: Database design, Express API and CRUD endpoints
- [ ] Weeks 6–8: React frontend
- [ ] Weeks 9–12: Authentication, tests and deployment

## Database design

![ER diagram](docs/er-diagram.png)

Key decisions:
- Current status is stored on `applications` and every change is logged in `status_history`
- Status values are limited to a fixed set using CHECK constraints
- Deleting an application cascades to its history and interviews
- Each user can't have two applications for the same company and role