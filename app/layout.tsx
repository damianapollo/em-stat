import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ToastProvider } from '@/components/ui/toast'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://em-stat.com'),
  title: {
    default: 'EM STAT — ABEM Board Prep & Emergency Medicine Community',
    template: '%s | EM STAT',
  },
  description: 'NPI-verified board prep for Emergency Medicine physicians. 2,500+ ABEM-aligned questions, clinical cases, jobs, and more.',
  keywords: ['ABEM board prep', 'emergency medicine questions', 'EM residency', 'ABEM exam', 'emergency medicine jobs'],
  authors: [{ name: 'EM STAT' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://em-stat.com',
    siteName: 'EM STAT',
    title: 'EM STAT — ABEM Board Prep & Emergency Medicine Community',
    description: 'NPI-verified board prep for Emergency Medicine physicians.',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'EM STAT',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EM STAT — ABEM Board Prep',
    description: 'NPI-verified board prep for Emergency Medicine physicians.',
    images: ['/og-default.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
