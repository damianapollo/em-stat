# EM Hub — Build Plan

**Product:** Free EM physician platform — qbank + jobs + cases + community  
**Stack:** Next.js 15 · TypeScript · Tailwind · shadcn/ui · Supabase · Vercel

## Phase Status

- [x] 0.1 — Next.js scaffold, config, PLAN.md
- [x] 0.2 — Supabase schema migrations + RLS
- [x] 0.3–0.4 — Auth (magic link + Google) + NPI verification
- [x] 0.5 — App shell (sidebar + theme)
- [x] 0.6 — Legal pages + consent architecture
- [x] 1.1–1.3 — Topics, question pipeline, admin review UI
- [x] 1.4–1.6 — Exam configurator, player, results
- [x] 1.7–1.8 — Dashboard, pass-probability gauge
- [ ] 1.9 — Content sprint (300 published questions)
- [ ] 2.x — Community: cases, forum, moderation
- [ ] 3.x — Jobs board + Stripe payments

## Quick Start

```bash
# 1. Clone and install
npm install

# 2. Set up Supabase
# Create project at https://app.supabase.com
# Copy env vars to .env.local (see .env.example)
# Run migrations: supabase db push (or paste into SQL editor)

# 3. Run dev server
npm run dev

# 4. Generate questions (needs ANTHROPIC_API_KEY)
npm run generate-questions
```

## Key Decisions
See DECISIONS.md
