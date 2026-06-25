import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { sessionId } = await request.json()

  // Aggregate score
  const { data: answers } = await supabase
    .from('test_session_questions')
    .select('is_correct')
    .eq('session_id', sessionId)

  const score = (answers ?? []).filter(a => a.is_correct).length

  const { error } = await supabase
    .from('test_sessions')
    .update({ score, completed_at: new Date().toISOString() })
    .eq('id', sessionId)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ score, total: (answers ?? []).length })
}
