'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Flag, Clock } from 'lucide-react'

interface Question {
  id: string
  stem: string
  options: { label: string; text: string }[]
  correct_index: number
  explanation: string
  position: number
  answered: boolean
  selectedIndex: number | null
  isCorrect: boolean | null
  topics?: { name: string } | null
}

interface ExamPlayerProps {
  sessionId: string
  mode: string
  questions: Question[]
}

const SECONDS_PER_QUESTION = 90

export function ExamPlayer({ sessionId, mode, questions: initialQuestions }: ExamPlayerProps) {
  const router = useRouter()
  const [questions, setQuestions] = useState(initialQuestions)
  const [currentIdx, setCurrentIdx] = useState(() => {
    const firstUnanswered = initialQuestions.findIndex(q => !q.answered)
    return firstUnanswered >= 0 ? firstUnanswered : 0
  })
  const [showExplanation, setShowExplanation] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION)
  const [startTime, setStartTime] = useState(Date.now())

  const current = questions[currentIdx]
  const answered = current?.answered
  const isTimed = mode === 'timed'
  const isTutor = mode === 'tutor'
  const answeredCount = questions.filter(q => q.answered).length
  const progress = Math.round((answeredCount / questions.length) * 100)

  // Timer
  useEffect(() => {
    if (!isTimed || answered) return
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isTimed, answered, currentIdx])

  useEffect(() => {
    setTimeLeft(SECONDS_PER_QUESTION)
    setStartTime(Date.now())
    setShowExplanation(false)
  }, [currentIdx])

  const submitAnswer = useCallback(async (selectedIndex: number) => {
    if (answered || submitting) return
    setSubmitting(true)
    const timeSpentMs = Date.now() - startTime

    const res = await fetch('/api/exam/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, questionId: current.id, selectedIndex, timeSpentMs }),
    })
    const data = await res.json()

    setQuestions(prev => prev.map((q, i) =>
      i === currentIdx
        ? { ...q, answered: true, selectedIndex, isCorrect: data.isCorrect, explanation: data.explanation ?? q.explanation }
        : q
    ))

    if (isTutor) setShowExplanation(true)
    setSubmitting(false)
  }, [answered, submitting, sessionId, current?.id, currentIdx, isTutor, startTime])

  async function finish() {
    setFinishing(true)
    await fetch('/api/exam/finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
    router.push(`/qbank/results/${sessionId}`)
  }

  const allAnswered = questions.every(q => q.answered)
  const isLast = currentIdx === questions.length - 1

  if (!current) return null

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <Progress value={progress} className="flex-1" />
        <span className="text-xs text-muted-foreground tabular-nums shrink-0">
          {answeredCount}/{questions.length}
        </span>
        {isTimed && !answered && (
          <div className={cn(
            'flex items-center gap-1 text-xs tabular-nums shrink-0',
            timeLeft <= 15 ? 'text-destructive font-medium' : 'text-muted-foreground'
          )}>
            <Clock className="h-3 w-3" />
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </div>
        )}
      </div>

      {/* Topic badge */}
      {current.topics?.name && (
        <Badge variant="secondary" className="text-xs">{current.topics.name}</Badge>
      )}

      {/* Question stem */}
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-sm font-medium leading-relaxed text-card-foreground">
          {current.stem}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {current.options.map((opt, i) => {
          const isSelected = current.selectedIndex === i
          const isCorrect = i === current.correct_index
          const showResult = answered || (isTimed && timeLeft === 0)

          let optClass = 'border-border text-foreground hover:border-primary/40 hover:bg-primary/5'
          if (showResult && isCorrect) optClass = 'border-success bg-success-muted text-foreground'
          else if (showResult && isSelected && !isCorrect) optClass = 'border-destructive bg-destructive/10 text-foreground'
          else if (isSelected && !answered) optClass = 'border-primary bg-primary/10 text-foreground'

          return (
            <button
              key={i}
              onClick={() => submitAnswer(i)}
              disabled={answered || submitting}
              className={cn(
                'w-full flex items-start gap-3 px-4 py-3 rounded-lg border text-left text-sm transition-colors',
                optClass,
                (answered || submitting) && 'cursor-default'
              )}
            >
              <span className="font-medium shrink-0 w-5">{opt.label}.</span>
              <span className="leading-relaxed">{opt.text}</span>
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {(showExplanation || (answered && !isTutor)) && current.explanation && (
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Explanation</p>
          <div className="prose-em text-sm">
            <p>{current.explanation}</p>
          </div>
        </div>
      )}

      {answered && !isTutor && !showExplanation && (
        <Button variant="ghost" size="sm" onClick={() => setShowExplanation(true)}>
          Show explanation
        </Button>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />Previous
        </Button>

        <div className="flex gap-2">
          {allAnswered ? (
            <Button onClick={finish} disabled={finishing}>
              {finishing ? 'Finishing…' : 'Finish & see results'}
            </Button>
          ) : isLast ? (
            <Button variant="outline" onClick={finish} disabled={finishing || !allAnswered}>
              <Flag className="h-4 w-4 mr-1" />Submit
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentIdx(i => Math.min(questions.length - 1, i + 1))}
            >
              Next<ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
