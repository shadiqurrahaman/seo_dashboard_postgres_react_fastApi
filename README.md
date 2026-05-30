# Growmos — Paid Media Dashboard

A multi-tenant SaaS dashboard for marketing decision makers. Users connect PostgreSQL or BigQuery, upload CSV/Excel files, and see live KPIs, trends, and campaign performance.

## Stack

- **Frontend**: React + Vite + TypeScript + Recharts + React Query
- **Backend**: FastAPI + SQLAlchemy (async) + Pandas
- **Database**: PostgreSQL
- **Auth**: JWT + Google OAuth
- **Deployment**: Vercel (frontend) + Render (backend) + Neon (Postgres)

## Run locally

```bash
cp .env.example .env       # fill in your Google OAuth credentials
docker compose up --build
```

- Frontend: http://localhost:5173
- API docs: http://localhost:8000/docs

## Deploy to production

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions to host on free tiers (Vercel + Render + Neon).

## Project structure

```
seo_dashboard/
├── backend/          FastAPI app (auth, uploads, data sources, dashboard API)
├── frontend/         React + Vite + TypeScript
├── .github/          CI/CD workflows
├── docker-compose.yml
├── render.yaml       Render deployment blueprint
└── DEPLOYMENT.md     Hosting guide
```

## Features

- Email/password + Google OAuth login
- CSV/Excel upload with auto column detection
- PostgreSQL connector (test connection, run query, sync)
- BigQuery connector (Google OAuth, project/dataset picker)
- Live dashboard: KPIs (ROAS, CPA, CVR, Spend), trend chart, channel breakdown, top campaigns
- Multi-tenant: every user belongs to an org, data is isolated per org
