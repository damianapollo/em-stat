'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

interface Props { userId: string; currentNpi?: string | null }

export function NpiVerificationForm({ userId, currentNpi }: Props) {
  const [npi, setNpi] = useState(currentNpi ?? '')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    const res = await fetch('/api/npi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ npi, userId }),
    })
    const data = await res.json()
    setResult({ ok: res.ok, message: data.message ?? (res.ok ? 'Submitted for review.' : 'Something went wrong.') })
    setLoading(false)
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="npi">NPI number (10 digits)</Label>
        <Input
          id="npi"
          placeholder="1234567890"
          value={npi}
          onChange={e => setNpi(e.target.value.replace(/\D/g, '').slice(0, 10))}
          maxLength={10}
          pattern="\d{10}"
          required
        />
      </div>
      {result && (
        <p className={`text-sm ${result.ok ? 'text-success' : 'text-destructive'}`}>
          {result.message}
        </p>
      )}
      <Button type="submit" disabled={loading || npi.length !== 10}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Submit for verification
      </Button>
    </form>
  )
}
