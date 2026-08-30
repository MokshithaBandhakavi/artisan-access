# KaamID — verified work identity for India's blue-collar workforce

KaamID is a full-stack hiring registry. Workers build a portable, verifiable work
identity (trade, skills, certificates, employer references); employers post jobs,
search verified talent, and move applicants through a shared hiring pipeline.

## Features

**Worker experience** (`/worker`, `/jobs`)
- Digital ID card: trade, experience, expected wage, languages, skills, availability
- Certifications and work history records
- Three-part verification: ID, skill assessment, employer reference
- Job feed with search, trade filter and an explainable match score; one-tap apply
- Application status tracking

**Employer experience** (`/employer`, `/workers`)
- Company profile, job posting (trade, city, wage + period, employment type, skills, openings)
- Verified worker directory with trade/city/skill search and verification filters
- Ranked applicants per job with match score

**Recruitment dashboard** (`/dashboard`)
- Kanban pipeline: applied → shortlisted → interview → hired / rejected
- Counts per stage, per-job funnel visibility, worker-side application tracking

**Innovations**
- Transparent 5-factor match engine (`src/lib/match.ts`): skill overlap 50, trade fit 20,
  city 15, experience 10, verification strength 5 — no black box scoring
- Verification stamps as first-class UI, so trust is visible rather than assumed
- Low-literacy friendly: high contrast, icon + colour coded status, short labels

## Tech stack

- **Frontend**: React 19, TanStack Start (SSR) + TanStack Router file routes, TanStack Query
- **Styling**: Tailwind CSS v4 with an OKLCH semantic token design system (`src/styles.css`)
- **Backend**: Lovable Cloud (Postgres, Auth, Row Level Security), server functions via TanStack Start
- **Auth**: email/password + Google OAuth, role selection at signup (worker / employer)
- **Build/deploy**: Vite 7, deployed as an edge worker

## Architecture

```text
src/routes/          file-based routes (index, auth, worker, workers, jobs, employer, dashboard)
src/components/kaam.tsx   shared UI (header, footer, verify chips, match pill)
src/lib/session.tsx  auth session + profile hooks
src/lib/match.ts     match scoring engine + trade taxonomy
src/integrations/supabase/  generated database/auth clients (browser + server)
```

Reads and writes go through the browser client under RLS; public surfaces (jobs,
worker directory) rely on narrow public SELECT policies.

## Database design

| Table | Purpose |
| --- | --- |
| `profiles` | name, phone, city, avatar, `account_type` (worker/employer/admin) |
| `user_roles` | role grants, checked via a `has_role` security-definer function |
| `worker_profiles` | trade, experience, expected wage, bio, skills, languages, availability, verification flags, rating |
| `certifications` | worker certificates: name, issuer, year, verified |
| `work_history` | employer name, role, from/to year, verified |
| `companies` | employer org: name, city, industry, about, verified |
| `jobs` | title, trade, city, wage + period, employment type, skills, openings, status |
| `applications` | job ↔ worker, `pipeline_stage` enum, match score, note |

A `handle_new_user` trigger creates the profile (and worker profile) on signup.
RLS: public read on jobs/companies/profiles/worker profiles/certs/history;
owner-scoped writes; applications readable only by the worker or the posting employer.

## Local development

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

Environment variables (`.env`) are provisioned by Lovable Cloud:
`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`.

## Demo path

1. Sign up as an employer → create the company → post a job
2. Sign up as a worker → complete the ID card, add a certificate and work history
3. Open `/jobs` → see the match score → apply
4. Employer opens `/dashboard` → move the applicant through the pipeline
