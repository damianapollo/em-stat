import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/db/users'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PassGauge } from '@/components/dashboard/PassGauge'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Session Results' }

interface Props { params: Promise<{ id: string }> }

export default async function ResultsPage({ params }: Props) {
  const { id } = await params
  const { auth } = await getCurrentUser()
  if (!auth) redirect('/login')

  const supabase = await createServerClient()

  const { data: session } = await supabase
    .from('test_sessions')
    .select('id, mode, score, total_questions, completed_at')
    .eq('id', id)
    .eq('user_id', auth.id)
    .single()

  if (!session || !session.completed_at) redirect('/qbank')

  const { data: sessionQuestions } = await supabase
    .from('test_session_questions')
    .select(`
      position, selected_index, is_correct,
      questions ( id, stem, options, correct_index, explanation, topics ( name ) )
    `)
    .eq('session_id', id)
    .order('position')

  // Lifetime stats for gauge
  const { data: allSessions } = await supabase
    .from('test_sessions')
    .select('score, total_questions')
    .eq('user_id', auth.id)
    .not('completed_at', 'is', null)

  const totalAnswered = (allSessions ?? []).reduce((s, r) => s + (r.total_questions ?? 0), 0)
  const totalCorrect = (allSessions ?? []).reduce((s, r) => s + (r.score ?? 0), 0)
  const pctCorrect = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0
  const sessionsCompleted = (allSessions ?? []).length

  const score = session.score ?? 0
  const total = session.total_questions ?? 0
  const pct = total > 0 ? Math.round((score / total) * 100) : 0

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Session Results</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/qbank">New session</Link>
        </Button>
      </div>

      {/* Score summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1 flex flex-col items-center py-6">
          <p className="text-sm text-muted-foreground mb-1">This session</p>
          <p className={cn(
            'text-5xl font-bold tabular-nums',
            pct >= 73 ? 'text-success' : pct >= 60 ? 'text-warning' : 'text-destructive'
          )}>{pct}%</p>
          <p className="text-sm text-muted-foreground mt-1">{score}/{total} correct</p>
        </Card>

        <Card className="md:col-span-2 flex items-center justify-center py-4">
          <PassGauge pctCorrect={pctCorrect} sessionsCompleted={sessionsCompleted} />
        </Card>
      </div>

      {/* Question-by-question breakdown */}
      <div>
        <h2 className="text-base font-semibold mb-3">Question review</h2>
        <div className="space-y-3">
          {(sessionQuestions ?? []).map((sq, idx) => {
            const q = sq.questions as any
            const correct = sq.is_correct

            return (
              <Card key={sq.position} className={cn(
                'border',
                correct ? 'border-success/30' : 'border-destructive/30'
              )}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <span className={cn(
                      'flex-none flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mt-0.5',
                      correct ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'
                    )}>
                      {correct ? '✓' : '✗'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">Q{idx + 1}</span>
                        {q?.topics?.name && <Badge variant="secondary" className="text-xs">{q.topics.name}</Badge>}
                      </div>
                      <p className="text-sm leading-relaxed">{q?.stem}</p>
                      {q?.options && (
                        <div className="mt-2 space-y-1">
                          {q.options.map((opt: any, i: number) => (
                            <p key={i} className={cn(
                              'text-xs',
                              i === q.correct_index ? 'text-success font-medium' :
                              i === sq.selected_index && !correct ? 'text-destructive line-through' :
                              'text-muted-foreground'
                            )}>
                              {opt.label}. {opt.text}
                            </p>
                          ))}
                        </div>
                      )}
                      {q?.explanation && (
                        <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                          {q.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div className="flex gap-3 pb-8">
        <Button asChild className="flex-1">
          <Link href="/qbank">New session</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
