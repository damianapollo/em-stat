'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { LogOut, Settings, User as UserIcon } from 'lucide-react'
import type { User } from '@/types'
import { daysUntil, ABEM_EXAM_DATE } from '@/lib/utils'

interface HeaderProps {
  user: User | null
  email: string
}

export function Header({ user, email }: HeaderProps) {
  const router = useRouter()
  const supabase = createClient()
  const days = daysUntil(ABEM_EXAM_DATE)

  const initials = user?.name
    ? user.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
    : email.slice(0, 2).toUpperCase()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="flex items-center justify-between h-14 px-6 border-b border-border bg-background shrink-0">
      <div className="flex items-center gap-3">
        {days > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{days}d</span>
            <span>until ABEM exam</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {user?.verification_status !== 'verified' && (
          <Badge variant="warning" className="text-xs hidden sm:inline-flex">
            NPI unverified
          </Badge>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="outline-none rounded-full focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src={undefined} />
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <p className="font-medium truncate">{user?.name ?? 'Account'}</p>
              <p className="text-xs text-muted-foreground truncate">{email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              <UserIcon className="mr-2 h-4 w-4" />Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <Settings className="mr-2 h-4 w-4" />Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
