'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, BookOpen, FileText, MessageSquare, Briefcase,
  Settings, Shield, ChevronRight, Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { User } from '@/types'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/qbank',     label: 'QBank',     icon: BookOpen },
  { href: '/cases',     label: 'Cases',     icon: FileText },
  { href: '/forum',     label: 'Forum',     icon: MessageSquare },
  { href: '/jobs',      label: 'Jobs',      icon: Briefcase },
]

interface SidebarProps {
  user: User | null
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-sidebar border-r border-white/5 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shrink-0">
          <Activity className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-sidebar-foreground tracking-tight">EM STAT</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
                  : 'text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {active && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
            </Link>
          )
        })}

        {user?.role === 'admin' && (
          <Link
            href="/admin"
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors mt-4',
              pathname.startsWith('/admin')
                ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
                : 'text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground'
            )}
          >
            <Shield className="w-4 h-4 shrink-0" />
            Admin
          </Link>
        )}
      </nav>

      {/* Settings */}
      <div className="px-3 py-4 border-t border-white/5">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          <Settings className="w-4 h-4 shrink-0" />
          Settings
        </Link>
      </div>
    </aside>
  )
}
