import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/db/users'
import { ExamPlayer } from '@/components/exam/ExamPlayer'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Exam Session' }

interface Props { params: Promise<{ id: string }> }

export default async function SessionPage({ params }: Props) {
  const { id } = await params
  const { auth } = await getCurrentUser()
  if (!auth) redirect('/login')

  const supabase = await createServerClient()

  // Load session + questions
  const { data: session } = await supabase
    .from('test_sessions')
    .select('id, mode, total_questions, completed_at')
    .eq('id', id)
    .eq('user_id', auth.id)
    .single()

  if (!session) redirect('/qbank')
  if (session.completed_at) redirect(`/qbank/results/${id}`)

  const { data: sessionQuestions } = await supabase
    .from('test_session_questions')
    .select(`
      position,
      selected_index,
      is_correct,
      question_id,
      questions (
        id, stem, options, correct_index, explanation, topic_id,
        topics ( name )
      )
    `)
    .eq('session_id', id)
    .order('position')

  return (
    <ExamPlayer
      sessionId={id}
      mode={session.mode}
      questions={(sessionQuestions ?? []).map(sq => ({
        ...sq.questions as any,
        position: sq.position,
        answered: sq.selected_index !== null,
        selectedIndex: sq.selected_index,
        isCorrect: sq.is_correct,
      }))}
    />
  )
}
