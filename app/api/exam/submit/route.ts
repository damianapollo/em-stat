import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { sessionId, questionId, selectedIndex, timeSpentMs } = await request.json()

  // Fetch the question to determine correctness
  const { data: question, error: qErr } = await supabase
    .from('questions')
    .select('id, correct_index, explanation')
    .eq('id', questionId)
    .single()

  if (qErr || !question) return NextResponse.json({ error: 'Question not found' }, { status: 404 })

  const isCorrect = selectedIndex === question.correct_index

  // Update test_session_questions
  const { error: uErr } = await supabase
    .from('test_session_questions')
    .update({
      selected_index: selectedIndex,
      is_correct: isCorrect,
      time_spent_ms: timeSpentMs ?? null,
      answered_at: new Date().toISOString(),
    })
    .eq('session_id', sessionId)
    .eq('question_id', questionId)

  if (uErr) return NextResponse.json({ error: uErr.message }, { status: 500 })

  return NextResponse.json({
    isCorrect,
    correctIndex: question.correct_index,
    explanation: question.explanation,
  })
}
