'use client'

import * as React from 'react'
import * as ToastPrimitives from '@radix-ui/react-toast'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastVariant = 'default' | 'destructive' | 'success'

interface ToastData {
  id: number
  title?: string
  description?: string
  variant?: ToastVariant
}

interface ToastContextValue {
  toast: (t: Omit<ToastData, 'id'>) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}

const variantClasses: Record<ToastVariant, string> = {
  default: 'border-border bg-card text-card-foreground',
  destructive: 'border-destructive bg-destructive text-destructive-foreground',
  success: 'border-success bg-success-muted text-foreground',
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastData[]>([])

  const toast = React.useCallback((t: Omit<ToastData, 'id'>) => {
    setToasts((prev) => [...prev, { ...t, id: Date.now() + Math.random() }])
  }, [])

  const remove = React.useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitives.Provider swipeDirection="right" duration={5000}>
        {children}
        {toasts.map((t) => (
          <ToastPrimitives.Root
            key={t.id}
            onOpenChange={(open) => {
              if (!open) remove(t.id)
            }}
            className={cn(
              'group pointer-events-auto relative flex w-full items-start justify-between gap-3 overflow-hidden rounded-md border p-4 pr-8 shadow-lg',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-right-full',
              'data-[swipe=end]:animate-out data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]',
              variantClasses[t.variant ?? 'default'],
            )}
          >
            <div className="grid gap-1">
              {t.title && (
                <ToastPrimitives.Title className="text-sm font-semibold">
                  {t.title}
                </ToastPrimitives.Title>
              )}
              {t.description && (
                <ToastPrimitives.Description className="text-sm opacity-90">
                  {t.description}
                </ToastPrimitives.Description>
              )}
            </div>
            <ToastPrimitives.Close
              className="absolute right-2 top-2 rounded-md p-1 opacity-60 transition-opacity hover:opacity-100"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </ToastPrimitives.Close>
          </ToastPrimitives.Root>
        ))}
        <ToastPrimitives.Viewport className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-sm" />
      </ToastPrimitives.Provider>
    </ToastContext.Provider>
  )
}
