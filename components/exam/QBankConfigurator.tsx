'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface Topic { id: string; name: string; parent_id: string | null; exam_weight: number | null }

const LENGTHS = [10, 20, 40]
const MODES = [
  { value: 'timed', label: 'Timed', description: '90 sec/question' },
  { value: 'untimed', label: 'Untimed', description: 'No time limit' },
  { value: 'tutor', label: 'Tutor', description: 'See answer after each question' },
]

export function QBankConfigurator({ topics }: { topics: Topic[] }) {
  const router = useRouter()
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [length, setLength] = useState(20)
  const [mode, setMode] = useState('timed')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const rootTopics = topics.filter(t => !t.parent_id)

  function toggleTopic(id: string) {
    setSelectedTopics(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  async function start() {
    setLoading(true)
    setError(null)
    const res = await fetch('/api/exam/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic_ids: selectedTopics.length > 0 ? selectedTopics : null,
        length,
        mode,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Failed to start session')
      setLoading(false)
      return
    }
    router.push(`/qbank/session/${data.sessionId}`)
  }

  return (
    <div className="space-y-6">
      {/* Topics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Topics</CardTitle>
          <p className="text-xs text-muted-foreground">
            Leave blank to include all topics (weighted by ABEM blueprint).
          </p>
        </CardHeader>
        <CardContent>
          {rootTopics.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No topics available yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {rootTopics.map(t => (
                <button
                  key={t.id}
                  onClick={() => toggleTopic(t.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                    selectedTopics.includes(t.id)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                  )}
                >
                  {t.name}
                  {t.exam_weight && (
                    <span className="ml-1.5 opacity-60">{t.exam_weight}%</span>
                  )}
                </button>
              ))}
            </div>
          )}
          {selectedTopics.length > 0 && (
            <button
              onClick={() => setSelectedTopics([])}
              className="text-xs text-muted-foreground hover:text-foreground mt-3 underline"
            >
              Clear selection
            </button>
          )}
        </CardContent>
      </Card>

      {/* Length */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Number of questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {LENGTHS.map(n => (
              <button
                key={n}
                onClick={() => setLength(n)}
                className={cn(
                  'flex-1 py-3 rounded-lg border text-sm font-medium transition-colors',
                  length === n
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mode */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {MODES.map(m => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={cn(
                  'py-3 px-3 rounded-lg border text-left transition-colors',
                  mode === m.value
                    ? 'bg-primary/10 border-primary'
                    : 'bg-transparent border-border hover:border-primary/30'
                )}
              >
                <p className={cn('text-sm font-medium', mode === m.value ? 'text-primary' : 'text-foreground')}>
                  {m.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button className="w-full" size="lg" onClick={start} disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Start {length}-question session
      </Button>
    </div>
  )
}
