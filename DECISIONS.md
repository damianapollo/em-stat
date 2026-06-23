# Architecture Decisions

## 2026-06-10 — Initial build

**D1: Next.js App Router**  
Chose App Router over Pages Router for RSC support, nested layouts (sidebar stays mounted), and better SSR for SEO on job/case pages.

**D2: Supabase over custom auth**  
Magic link + Google OAuth out of the box. RLS means security is enforced at the DB layer, not just API layer. Free tier is generous enough for launch.

**D3: Tailwind tokens over CSS vars on elements**  
Prototype's biggest failure was hardcoded hex in inline styles. All colors go through tailwind.config.ts tokens → CSS custom properties in globals.css. Dark mode via `class` strategy.

**D4: Sidebar always dark navy, content area themed**  
Sidebar (`--sidebar`) is always dark regardless of light/dark mode (UWorld-style). Content area switches between light and dark. This simplifies the sidebar code and matches the prototype's proven layout.

**D5: Qbank questions served from Supabase, not bundled**  
Questions are in DB from day one. This enables per-user progress tracking, stats, and the pass-probability model from the first session.

**D6: Pass-probability = logistic regression on topic weights**  
Simple, explainable, honest about methodology. Will add a "How this works" page. v2 will train on real outcome data once we have it.

**D7: NPI verification required for full access**  
Unverified users can browse but can't take exams or post cases. This is what makes the physician audience monetizable (ads/research/recruiter access). Admin manual-review fallback for NPI mismatches.
