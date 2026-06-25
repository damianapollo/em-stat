import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { topic_ids, length = 20, mode = 'timed' } = await request.json()

  // Fetch random published questions
  let query = supabase
    .from('questions')
    .select('id')
    .eq('status', 'published')
    .limit(length * 3) // over-fetch then randomly pick

  if (topic_ids && topic_ids.length > 0) {
    query = query.in('topic_id', topic_ids)
  }

  const { data: pool, error: qErr } = await query
  if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 })
  if (!pool || pool.length === 0) {
    return NextResponse.json({ error: 'No questions available for the selected topics.' }, { status: 400 })
  }

  // Shuffle and slice
  const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, length)
  const questionIds = shuffled.map(q => q.id)

  // Create session
  const { data: session, error: sErr } = await supabase
    .from('test_sessions')
    .insert({
      user_id: user.id,
      mode,
      total_questions: questionIds.length,
      topic_ids: topic_ids ?? null,
    })
    .select('id')
    .single()

  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 })

  // Insert question rows
  const rows = questionIds.map((qid, idx) => ({
    session_id: session.id,
    question_id: qid,
    position: idx,
  }))
  await supabase.from('test_session_questions').insert(rows)

  return NextResponse.json({ sessionId: session.id })
}
