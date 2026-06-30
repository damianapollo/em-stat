'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Eye, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'

type Option = { label: string; text: string }
type Question = {
  id: string
  stem: string
  options: Option[]
  correct_index: number
  explanation: string
  status: string
  subtopic: string | null
  difficulty: number | null
  topics: { name: string } | null
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-800',
  review: 'bg-blue-100 text-blue-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-600',
}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [filter, setFilter] = useState<string>('draft')
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [acting, setActing] = useState<string | null>(null)
  const supabase = createClient()

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('questions')
      .select('id, stem, options, correct_index, explanation, status, subtopic, difficulty, topics(name)')
      .eq('status', filter)
      .order('created_at', { ascending: false })
      .limit(100)
    setQuestions((data as Question[]) ?? [])
    setLoading(false)
  }, [filter, supabase])

  useEffect(() => { load() }, [load])

  async function setStatus(id: string, status: string) {
    setActing(id)
    await supabase.from('questions').update({ status }).eq('id', id)
    setQuestions(qs => qs.filter(q => q.id !== id))
    setActing(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Questions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{questions.length} {filter} questions</p>
        </div>
        <div className="flex gap-2">
          {['draft', 'review', 'published', 'archived'].map(s => (
            <button
              key={s}
              onClick={() => { setFilter(s); setExpanded(null) }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          No {filter} questions.
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map(q => (
            <Card key={q.id} className="overflow-hidden">
              <CardHeader className="py-3 px-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[q.status]}`}>
                        {q.status}
                      </span>
                      {q.topics?.name && (
                        <span className="text-xs text-muted-foreground">{q.topics.name}</span>
                      )}
                      {q.subtopic && (
                        <span className="text-xs text-muted-foreground">· {q.subtopic}</span>
                      )}
                      {q.difficulty && (
                        <span className="text-xs text-muted-foreground">· Difficulty {q.difficulty}/5</span>
                      )}
                    </div>
                    <p className="text-sm line-clamp-2">{q.stem}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {filter === 'draft' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-green-700 border-green-200 hover:bg-green-50"
                          disabled={acting === q.id}
                          onClick={() => setStatus(q.id, 'published')}
                        >
                          {acting === q.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                          Publish
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-red-700 border-red-200 hover:bg-red-50"
                          disabled={acting === q.id}
                          onClick={() => setStatus(q.id, 'archived')}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Discard
                        </Button>
                      </>
                    )}
                    {filter === 'published' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        disabled={acting === q.id}
                        onClick={() => setStatus(q.id, 'archived')}
                      >
                        Unpublish
                      </Button>
                    )}
                    {filter === 'archived' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-green-700 border-green-200 hover:bg-green-50"
                        disabled={acting === q.id}
                        onClick={() => setStatus(q.id, 'published')}
                      >
                        Restore
                      </Button>
                    )}
                    <button
                      onClick={() => setExpanded(expanded === q.id ? null : q.id)}
                      className="p-1.5 rounded hover:bg-muted transition-colors"
                    >
                      {expanded === q.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </CardHeader>

              {expanded === q.id && (
                <CardContent className="pt-0 px-4 pb-4 border-t bg-muted/30">
                  <div className="mt-3 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Full stem</p>
                      <p className="text-sm leading-relaxed">{q.stem}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Options</p>
                      <div className="space-y-1.5">
                        {q.options.map((opt, i) => (
                          <div
                            key={i}
                            className={`flex gap-2 text-sm p-2 rounded ${
                              i === q.correct_index ? 'bg-green-50 border border-green-200' : 'bg-card border'
                            }`}
                          >
                            <span className={`font-bold w-5 shrink-0 ${i === q.correct_index ? 'text-green-700' : 'text-muted-foreground'}`}>
                              {opt.label}.
                            </span>
                            <span>{opt.text}</span>
                            {i === q.correct_index && (
                              <CheckCircle className="h-3.5 w-3.5 text-green-600 ml-auto shrink-0 mt-0.5" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Explanation</p>
                      <p className="text-sm leading-relaxed">{q.explanation}</p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
