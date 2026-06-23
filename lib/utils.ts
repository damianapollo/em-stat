import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, perUnit = 'yr') {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}k/${perUnit}`
  }
  return `$${amount}/${perUnit}`
}

export function daysUntil(targetDate: Date): number {
  const now  = new Date()
  const diff = targetDate.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

// ABEM 2026 Certifying Exam: Oct 29 – Nov 7, 2026
export const ABEM_EXAM_DATE = new Date('2026-10-29')

/**
 * Logistic regression pass-probability model.
 * Threshold: ABEM ~73% passing score.
 * Returns 0–100 integer.
 */
export function passProbability(pctCorrect: number, sessionsCompleted: number): number {
  const baseLogit = (pctCorrect - 73) * 0.12 + Math.min(sessionsCompleted * 0.08, 1.5)
  const prob = 1 / (1 + Math.exp(-baseLogit))
  return Math.round(prob * 100)
}
