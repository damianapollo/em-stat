import type { Metadata } from 'next'
import { getCurrentUser } from '@/lib/db/users'
import { createServerClient } from '@/lib/supabase/server'
import { PassGauge } from '@/components/dashboard/PassGauge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { daysUntil, ABEM_EXAM_DATE } from '@/lib/utils'
import { BookOpen, Target, TrendingUp, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const { auth, profile } = await getCurrentUser()
  const supabase = await createServerClient()
  const days = daysUntil(ABEM_EXAM_DATE)

  // Fetch aggregate stats from test sessions
  const { data: stats } = await supabase
    .from('test_sessions')
    .select('score, total_questions, completed_at')
    .eq('user_id', auth!.id)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })

  const sessions = stats ?? []
  const sessionsCompleted = sessions.length
  const totalAnswered = sessions.reduce((s, r) => s + (r.total_questions ?? 0), 0)
  const totalCorrect = sessions.reduce((s, r) => s + (r.score ?? 0), 0)
  const pctCorrect = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

  const isVerified = profile?.verification_status === 'verified'

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold">
          {profile?.name ? `Hi, ${profile.name.split(' ')[0]}` : 'Dashboard'}
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {days > 0 ? `${days} days until the ABEM exam — keep going.` : 'Good luck on your exam!'}
        </p>
      </div>

      {/* NPI Banner */}
      {!isVerified && (
        <div className="flex items-center gap-3 rounded-lg border border-warning/30 bg-warning-muted px-4 py-3">
          <AlertCircle className="h-4 w-4 text-warning shrink-0" />
          <p className="text-sm text-warning-foreground flex-1">
            Verify your NPI to unlock full access to the QBank and community.
          </p>
          <Button size="sm" variant="outline" asChild>
            <Link href="/settings#npi">Verify NPI</Link>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pass Gauge */}
        <Card className="md:col-span-1 flex flex-col items-center justify-center py-6">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-base">Pass Probability</CardTitle>
          </CardHeader>
          <CardContent>
            <PassGauge pctCorrect={pctCorrect} sessionsCompleted={sessionsCompleted} />
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <StatCard
            icon={BookOpen}
            label="Questions answered"
            value={totalAnswered.toLocaleString()}
          />
          <StatCard
            icon={Target}
            label="Accuracy"
            value={totalAnswered > 0 ? `${pctCorrect}%` : '—'}
          />
          <StatCard
            icon={TrendingUp}
            label="Sessions completed"
            value={sessionsCompleted.toString()}
          />
          <StatCard
            icon={Clock}
            label="Days remaining"
            value={days > 0 ? days.toString() : 'Exam day!'}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-semibold mb-3">Quick start</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <QuickAction
            href="/qbank"
            title="Start a session"
            description="Custom exam by topic and length"
            badge="QBank"
          />
          <QuickAction
            href="/cases"
            title="Browse cases"
            description="Clinical case discussions"
            badge="Cases"
          />
          <QuickAction
            href="/forum"
            title="Join the forum"
            description="Discuss with EM colleagues"
            badge="Community"
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  )
}

function QuickAction({ href, title, description, badge }: {
  href: string; title: string; description: string; badge: string
}) {
  return (
    <Link href={href}>
      <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
        <CardContent className="pt-4 pb-4">
          <Badge variant="secondary" className="mb-2 text-xs">{badge}</Badge>
          <p className="font-medium text-sm">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
