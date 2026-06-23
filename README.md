# EM Hub

A full-stack board prep platform for Emergency Medicine physicians. Built with Next.js 15, Supabase, and Tailwind CSS.

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS + CSS custom properties |
| Database | Supabase (Postgres + Row-Level Security) |
| Auth | Supabase Auth (Google OAuth + Magic Link) |
| Deployment | Vercel |
| Email | Resend (magic links) |
| AI | Anthropic Claude API (question generation) |

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo>
cd em-hub
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set up Supabase

Create a project at [supabase.com](https://supabase.com), then run migrations:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run all migrations in order
supabase db push
```

Migrations are in `supabase/migrations/`:
- `001_initial_schema.sql` — All tables, indexes, triggers
- `002_rls_policies.sql` — Row-level security policies
- `003_seed_topics.sql` — 20 ABEM exam topics with weights
- `004_auth_trigger.sql` — Auto-creates user profile on signup
- `005_schema_fixes.sql` — Column additions (run after 001)

### 4. Configure Supabase Auth

In your Supabase dashboard:
1. **Authentication → Providers** → Enable Google OAuth
   - Add Google client ID + secret from [console.cloud.google.com](https://console.cloud.google.com)
2. **Authentication → URL Configuration**
   - Site URL: `http://localhost:3000` (dev) or your production URL
   - Redirect URLs: `http://localhost:3000/api/auth/callback`
3. **Authentication → Email** → Enable magic links

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Generating Questions

Once your database is set up with topics:

```bash
# Generate 50 questions for one topic
npx tsx scripts/generate-questions.ts --topic "Cardiovascular" --count 50

# Generate 50 questions for every topic (20 topics × 50 = 1,000 drafts)
npx tsx scripts/generate-questions.ts --all --count 50
```

Questions are inserted as `draft` status. Reviewers/admins publish them at `/admin/questions`.

---

## Project Structure

```
em-hub/
├── app/
│   ├── (app)/              # Authenticated app shell
│   │   ├── dashboard/      # Dashboard + pass-probability gauge
│   │   ├── qbank/          # Question bank (lobby → session → results)
│   │   ├── forum/          # Community threads + comments
│   │   ├── jobs/           # Jobs board
│   │   ├── cases/          # Case discussions
│   │   └── settings/       # Profile + NPI verification
│   ├── (auth)/             # Login + signup
│   ├── (marketing)/        # Landing page + legal
│   ├── admin/              # Admin panel (questions, users)
│   └── api/                # REST endpoints
├── components/
│   ├── layout/             # Sidebar, Header
│   ├── qbank/              # ExamLobby, QuestionPlayer, ResultsView
│   ├── dashboard/          # PassGauge, QuickStart
│   ├── forum/              # ForumList, ThreadDetail
│   ├── jobs/               # JobsBoard
│   ├── admin/              # AdminQuestionQueue
│   └── settings/           # SettingsPage
├── lib/
│   ├── db/                 # Typed DB query helpers
│   ├── supabase/           # Client, server, middleware
│   ├── hooks/              # useTheme
│   └── utils.ts            # cn, formatCurrency, passProbability, daysUntil
├── types/
│   └── database.ts         # TypeScript types auto-generated from schema
├── scripts/
│   └── generate-questions.ts  # Claude API question generation
└── supabase/
    └── migrations/         # SQL migrations (run in order)
```

---

## Roles

| Role | Access |
|---|---|
| `user` | Browse, start sessions (if verified) |
| `author` | Write questions (draft → review only) |
| `reviewer` | Approve/reject questions (review → published) |
| `admin` | Full access, bypass all RLS |

Set role via Supabase dashboard → Table Editor → `users` table.

## NPI Verification Flow

1. User submits NPI on signup or `/settings/verification`
2. App queries NPPES API (`/api/npi`) — checks EM taxonomy codes
3. If valid EM provider → `npi_review_queue` entry created
4. Admin approves → `users.verification_status = 'verified'`
5. Verified users get full qbank + community access

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set all env vars in Vercel dashboard under Project → Settings → Environment Variables.

---

## Exam Configuration

- **ABEM 2026 Certifying Exam**: Oct 29 – Nov 7, 2026
- **Format**: 305 MCQs · Two 3h10m sections
- **Passing**: ~73% (varies by year)
- **Pass probability model**: Logistic regression on `pct_correct` vs 73% threshold + session count factor

```ts
// lib/utils.ts
passProbability(pctCorrect: number, sessionsCompleted: number): number
// Returns 0–100 integer
```

---

## License

Private. All rights reserved.
