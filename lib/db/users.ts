import { createServerClient } from '@/lib/supabase/server'
import type { User } from '@/types'

export async function getCurrentUser(): Promise<{ auth: any; profile: User | null }> {
  const supabase = await createServerClient()
  const { data: { user: auth } } = await supabase.auth.getUser()
  if (!auth) return { auth: null, profile: null }
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', auth.id)
    .single()
  return { auth, profile: profile as User | null }
}

export async function updateProfile(userId: string, updates: Partial<User>) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function submitNpiForReview(userId: string, npi: string, npiData: object) {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('npi_review_queue')
    .upsert({ user_id: userId, npi, npi_data: npiData, status: 'pending' })
    .select()
    .single()
  return data
}

export async function toggleBookmark(userId: string, questionId: string): Promise<'added' | 'removed'> {
  const supabase = await createServerClient()
  const { data: existing } = await supabase
    .from('bookmarks')
    .select()
    .eq('user_id', userId)
    .eq('question_id', questionId)
    .single()
  if (existing) {
    await supabase.from('bookmarks').delete().eq('user_id', userId).eq('question_id', questionId)
    return 'removed'
  }
  await supabase.from('bookmarks').insert({ user_id: userId, question_id: questionId })
  return 'added'
}
