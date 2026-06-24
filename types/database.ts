// Hand-written domain types mirroring the data model in
// EM-Website-Product-Plan.md §5. In Phase 0.2, once the Supabase migration
// lands, regenerate these from the live schema:
//
//   supabase gen types typescript --local > types/database.ts
//
// Until then, these placeholders let the app typecheck and give callers a
// stable shape to code against.

export type UserRole = 'member' | 'reviewer' | 'admin'
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected'
export type TrainingLevel = 'resident' | 'fellow' | 'attending' | 'pa_np' | 'other'

export interface User {
  id: string
  email: string
  name: string | null
  npi: string | null
  verification_status: VerificationStatus
  role: UserRole
  specialty: string | null
  training_level: TrainingLevel | null
  grad_year: number | null
  region: string | null
  marketing_consent: boolean
  // Consent architecture (Phase 0.6) — captured at signup so later
  // monetization doesn't require retrofitting.
  tos_accepted_at: string | null
  privacy_accepted_at: string | null
  created_at: string
}

export type QuestionStatus = 'draft' | 'review' | 'published' | 'archived'

export interface Question {
  id: string
  stem: string
  options: { label: string; text: string }[]
  correct_index: number
  explanation: string
  topic_id: string
  subtopic: string | null
  difficulty: number | null
  status: QuestionStatus
  author_id: string | null
  reviewer_id: string | null
  image_url: string | null
  refs: { pmid: string; citation?: string }[] | null
  created_at: string
}

export interface Topic {
  id: string
  name: string
  parent_id: string | null
  exam_weight: number | null
}

export type JobType = 'perm' | 'locums' | 'prn'

export interface Job {
  id: string
  title: string
  employer_id: string | null
  location: string | null
  pay_min: number | null
  pay_max: number | null
  type: JobType | null
  tags: string[] | null
  description: string | null
  is_active: boolean
  paid_until: string | null
  posted_by: string | null
  created_at: string
  updated_at: string
}

export interface Bookmark {
  user_id: string
  question_id: string
  created_at: string
}

export type NpiReviewStatus = 'pending' | 'approved' | 'rejected'

export interface NpiReviewQueueItem {
  id: string
  user_id: string
  npi: string
  npi_data: unknown
  status: NpiReviewStatus
  created_at: string
}

// Placeholder for the Supabase-generated `Database` type. Replaced by
// `supabase gen types` output in Phase 0.2; until then the Supabase clients
// are left untyped so queries don't depend on a schema that isn't live yet.
export type Database = unknown
