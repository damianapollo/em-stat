# EM STAT — Build Plan

**Product:** Free EM physician platform — qbank + jobs + cases + community  
**Stack:** Next.js 15 · TypeScript · Tailwind · shadcn/ui · Supabase · Vercel

## Phase Status

- [x] 0.1 — Next.js scaffold, config, PLAN.md
- [x] 0.2 — Supabase schema migrations + RLS (`supabase/migrations/001_initial_schema.sql`)
- [x] 0.3–0.4 — Auth (magic link + Google) + OAuth callback + NPI verification API
- [x] 0.5 — App shell (sidebar + header + protected layout)
- [ ] 0.6 — Legal pages (terms, privacy) + marketing landing page
- [x] 1.1 — Topic seed (18 ABEM topics in migration)
- [ ] 1.2 — Admin question review UI (`/admin/questions`)
- [x] 1.3 — QBank configurator (`/qbank`)
- [x] 1.4–1.6 — Exam player (`/qbank/session/[id]`) + results (`/qbank/results/[id]`)
- [x] 1.7–1.8 — Dashboard with pass-probability gauge
- [ ] 1.9 — Content sprint (300 published questions via `generate-questions` script)
- [ ] 2.x — Community: forum, cases, moderation
- [ ] 3.x — Jobs board + Stripe payments

## What's Built (as of 2026-06-24)

### Core pages
- `/login` — Magic link + Google OAuth login
- `/dashboard` — Stats cards, PassGauge, quick-start links
- `/qbank` — Exam configurator (topic picker, length, mode)
- `/qbank/session/[id]` — Exam player (timed/untimed/tutor modes)
- `/qbank/results/[id]` — Results review with per-question breakdown
- `/settings` — NPI verification form + account info

### API routes
- `POST /api/auth/callback` — OAuth code exchange + profile upsert
- `POST /api/exam/start` — Create session with shuffled questions
- `POST /api/exam/submit` — Score answer, return correctness + explanation
- `POST /api/exam/finish` — Finalize session, compute score
- `POST /api/npi` — NPPES lookup + queue for admin review

### Components
- `components/ui/` — button, input, label, card, badge, progress, separator, avatar, dropdown-menu, toast
- `components/layout/` — Sidebar, Header
- `components/dashboard/` — PassGauge
- `components/exam/` — QBankConfigurator, ExamPlayer
- `components/settings/` — NpiVerificationForm

## Next Up

1. **Run the migration** — paste `supabase/migrations/001_initial_schema.sql` into Supabase SQL Editor
2. **Enable Google OAuth** in Supabase Auth → Providers
3. **Generate questions** — `npm run generate-questions` (needs ANTHROPIC_API_KEY)
4. **Admin question queue** — `/admin/questions` review/publish UI
5. **Forum + Cases** — Phase 2.x

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:3000
```
