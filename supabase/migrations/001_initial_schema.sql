-- EM STAT — Initial Schema
-- Run in order in the Supabase SQL Editor (or via: supabase db push)

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────
create table if not exists public.users (
  id                  uuid primary key references auth.users(id) on delete cascade,
  email               text not null unique,
  name                text,
  npi                 text,
  verification_status text not null default 'unverified'
                      check (verification_status in ('unverified','pending','verified','rejected')),
  role                text not null default 'member'
                      check (role in ('member','reviewer','admin')),
  specialty           text,
  training_level      text check (training_level in ('resident','fellow','attending','pa_np','other')),
  grad_year           int,
  region              text,
  marketing_consent   boolean not null default false,
  tos_accepted_at     timestamptz,
  privacy_accepted_at timestamptz,
  created_at          timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can read own row"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own row"
  on public.users for update
  using (auth.uid() = id);

create policy "Service role can do anything"
  on public.users for all
  using (auth.role() = 'service_role');

-- Admins can read all users
create policy "Admins can read all users"
  on public.users for select
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

-- ─────────────────────────────────────────
-- TOPICS
-- ─────────────────────────────────────────
create table if not exists public.topics (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  parent_id   uuid references public.topics(id) on delete set null,
  exam_weight numeric(5,2)
);

alter table public.topics enable row level security;

create policy "Topics are publicly readable"
  on public.topics for select
  using (true);

create policy "Admins can manage topics"
  on public.topics for all
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

-- ─────────────────────────────────────────
-- QUESTIONS
-- ─────────────────────────────────────────
create table if not exists public.questions (
  id            uuid primary key default uuid_generate_v4(),
  stem          text not null,
  options       jsonb not null, -- [{ label: "A", text: "..." }, ...]
  correct_index int not null,
  explanation   text not null default '',
  topic_id      uuid references public.topics(id) on delete set null,
  subtopic      text,
  difficulty    int check (difficulty between 1 and 5),
  status        text not null default 'draft'
                check (status in ('draft','review','published','archived')),
  author_id     uuid references auth.users(id) on delete set null,
  reviewer_id   uuid references auth.users(id) on delete set null,
  image_url     text,
  refs          jsonb,
  created_at    timestamptz not null default now()
);

alter table public.questions enable row level security;

create policy "Published questions visible to verified members"
  on public.questions for select
  using (
    status = 'published'
    and exists (
      select 1 from public.users u
      where u.id = auth.uid()
      and u.verification_status = 'verified'
    )
  );

create policy "Admins can manage all questions"
  on public.questions for all
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

create policy "Reviewers can read review-queue questions"
  on public.questions for select
  using (
    status in ('review','published')
    and exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role in ('reviewer','admin')
    )
  );

-- ─────────────────────────────────────────
-- TEST SESSIONS
-- ─────────────────────────────────────────
create table if not exists public.test_sessions (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  mode            text not null default 'timed'
                  check (mode in ('timed','untimed','tutor')),
  total_questions int,
  score           int,
  topic_ids       uuid[],
  completed_at    timestamptz,
  created_at      timestamptz not null default now()
);

alter table public.test_sessions enable row level security;

create policy "Users can manage own sessions"
  on public.test_sessions for all
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- TEST SESSION QUESTIONS
-- ─────────────────────────────────────────
create table if not exists public.test_session_questions (
  id             uuid primary key default uuid_generate_v4(),
  session_id     uuid not null references public.test_sessions(id) on delete cascade,
  question_id    uuid not null references public.questions(id) on delete cascade,
  position       int not null,
  selected_index int,
  is_correct     boolean,
  time_spent_ms  int,
  answered_at    timestamptz
);

alter table public.test_session_questions enable row level security;

create policy "Users can manage own session questions"
  on public.test_session_questions for all
  using (
    exists (
      select 1 from public.test_sessions ts
      where ts.id = session_id and ts.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- BOOKMARKS
-- ─────────────────────────────────────────
create table if not exists public.bookmarks (
  user_id     uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, question_id)
);

alter table public.bookmarks enable row level security;

create policy "Users can manage own bookmarks"
  on public.bookmarks for all
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- NPI REVIEW QUEUE
-- ─────────────────────────────────────────
create table if not exists public.npi_review_queue (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  npi        text not null,
  npi_data   jsonb,
  status     text not null default 'pending'
             check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

alter table public.npi_review_queue enable row level security;

create policy "Users can insert own NPI requests"
  on public.npi_review_queue for insert
  with check (auth.uid() = user_id);

create policy "Users can read own NPI requests"
  on public.npi_review_queue for select
  using (auth.uid() = user_id);

create policy "Admins can manage NPI queue"
  on public.npi_review_queue for all
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

-- ─────────────────────────────────────────
-- SEED: ABEM TOPIC BLUEPRINT
-- ─────────────────────────────────────────
insert into public.topics (name, exam_weight) values
  ('Abdominal & GI Emergencies',          9),
  ('Cardiovascular Emergencies',          9),
  ('Obstetric & Gynecologic Emergencies', 5),
  ('Environmental Emergencies',           3),
  ('Head, Eye, Ear, Nose, Throat',        6),
  ('Hematologic Emergencies',             3),
  ('Immune System Disorders',             3),
  ('Nervous System Emergencies',          7),
  ('Orthopedic Emergencies',              6),
  ('Psychobehavioral Emergencies',        5),
  ('Renal & Urologic Emergencies',        4),
  ('Respiratory Emergencies',             9),
  ('Skin Disorders',                      3),
  ('Systemic Infectious Disorders',       6),
  ('Toxicologic Emergencies',             5),
  ('Traumatic Emergencies',              12),
  ('Procedures & Skills',                 8),
  ('Other Core Competencies',             7)
on conflict do nothing;
