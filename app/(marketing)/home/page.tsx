import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free ABEM Board Prep & EM Community',
}

// Placeholder landing page so the public root ('/') resolves while the full
// marketing site is built in Phase 0.6. Real copy/design comes later.
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-bold text-foreground">EM STAT</h1>
      <p className="max-w-md text-muted-foreground">
        Free, NPI-verified ABEM board prep and community for emergency medicine
        physicians. Coming soon.
      </p>
    </main>
  )
}
