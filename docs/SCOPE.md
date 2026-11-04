# Job Application Tracker — Scope (v1)

## Problem
Applying for internships and graduate roles means juggling dozens of
applications across different sites. Students lose track of where they
applied, what stage each application is at, and when to follow up.

## Users
Students and graduates applying for jobs. I'm the first user: I will use
it to track my own 2027/28 internship applications.

## Core features (v1)
1. Create, view, edit and delete job applications
2. Move applications through a status pipeline with saved history
3. Search, filter and sort applications, plus a summary dashboard
4. Log interviews and follow-up reminders
5. User sign-up and login, with private per-user data

## Out of scope for v1
Email or Gmail import, browser extension, AI features, mobile app,
calendar sync, email notifications, team sharing, résumé file uploads.

## Tech stack
React + TypeScript, Node.js + Express, PostgreSQL.
Deployed: Vercel (frontend), Fly.io (backend + database).

## Data model (draft)
users, applications, status_history, interviews

## Definition of done
- Live deployed link
- Responsive layout that works on a phone
- Input validation and clear error messages
- 10–15 automated tests
- README with screenshots, setup steps and design decisions