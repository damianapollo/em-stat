'use client'

import { passProbability } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface PassGaugeProps {
  pctCorrect: number
  sessionsCompleted: number
  className?: string
}

export function PassGauge({ pctCorrect, sessionsCompleted, className }: PassGaugeProps) {
  const prob = passProbability(pctCorrect, sessionsCompleted)
  const circumference = 2 * Math.PI * 54
  const offset = circumference - (prob / 100) * circumference

  const color =
    prob >= 75 ? 'hsl(142 76% 36%)' :
    prob >= 50 ? 'hsl(38 92% 50%)' :
    'hsl(0 84% 55%)'

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--secondary))" strokeWidth="10" />
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tabular-nums">{prob}%</span>
          <span className="text-xs text-muted-foreground">pass prob.</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center max-w-[140px]">
        Based on {sessionsCompleted} session{sessionsCompleted !== 1 ? 's' : ''} · 73% ABEM threshold
      </p>
    </div>
  )
}
