'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'magic' | 'password' | 'signup'>('magic')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/dashboard'
  const router = useRouter()

  const supabase = createClient()

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback?redirect=${encodeURIComponent(redirect)}` },
    })
    setLoading(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else router.push(redirect)
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else router.push(redirect)
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback?redirect=${encodeURIComponent(redirect)}` },
    })
    if (error) { setError(error.message); setGoogleLoading(false) }
  }

  if (sent) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">??</div>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>We sent a magic link to <strong>{email}</strong>. Click it to sign in.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="ghost" className="w-full" onClick={() => setSent(false)}>Use a different email</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="text-2xl font-bold text-primary mb-1">EM STAT</div>
        <CardTitle>{mode === 'signup' ? 'Create account' : 'Sign in'}</CardTitle>
        <CardDescription>NPI-verified board prep for Emergency Medicine</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={googleLoading}>
          {googleLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : (
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">or</span></div>
        </div>

        {mode === 'magic' ? (
          <form onSubmit={handleMagicLink} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" placeholder="you@hospital.edu" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || !email}>
              {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />}
              Send magic link
            </Button>
            <div className="flex flex-col gap-1">
              <button type="button" className="text-xs text-muted-foreground underline hover:text-foreground" onClick={() => { setMode('password'); setError(null) }}>Sign in with password</button>
              <button type="button" className="text-xs text-muted-foreground underline hover:text-foreground" onClick={() => { setMode('signup'); setError(null) }}>Create a new account</button>
            </div>
          </form>
        ) : mode === 'password' ? (
          <form onSubmit={handlePassword} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email-pw">Email address</Label>
              <Input id="email-pw" type="email" placeholder="you@hospital.edu" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || !email || !password}>
              {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />}
              Sign in
            </Button>
            <div className="flex flex-col gap-1">
              <button type="button" className="text-xs text-muted-foreground underline hover:text-foreground" onClick={() => { setMode('signup'); setError(null) }}>Need an account? Sign up</button>
              <button type="button" className="text-xs text-muted-foreground underline hover:text-foreground" onClick={() => { setMode('magic'); setError(null) }}>Use magic link instead</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email-su">Email address</Label>
              <Input id="email-su" type="email" placeholder="you@hospital.edu" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password-su">Password</Label>
              <Input id="password-su" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || !email || !password}>
              {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />}
              Create account
            </Button>
            <button type="button" className="w-full text-xs text-muted-foreground underline hover:text-foreground" onClick={() => { setMode('password'); setError(null) }}>Already have an account? Sign in</button>
          </form>
        )}

        <p className="text-center text-xs text-muted-foreground">
          By signing in you agree to our{' '}
          <a href="/terms" className="underline hover:text-foreground">Terms</a>{' '}and{' '}
          <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a>.
        </p>
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}
