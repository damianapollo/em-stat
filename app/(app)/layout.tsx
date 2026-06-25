import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/db/users'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { auth, profile } = await getCurrentUser()

  if (!auth) redirect('/login')

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={profile} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header user={profile} email={auth.email!} />
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
