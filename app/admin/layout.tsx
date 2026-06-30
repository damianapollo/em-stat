import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/db/users'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { auth, profile } = await getCurrentUser()
  if (!auth || profile?.role !== 'admin') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-6">
          <span className="font-bold text-primary">EM STAT Admin</span>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin/questions" className="text-muted-foreground hover:text-foreground transition-colors">
              Questions
            </Link>
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              &larr; Back to app
            </Link>
          </nav>
        </div>
      </div>
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
