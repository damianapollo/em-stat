import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://em-stat.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/jobs/', '/salary-explorer', '/methodology', '/advertise'],
        disallow: [
          '/dashboard',
          '/qbank',
          '/cases',
          '/forum',
          '/settings',
          '/profile',
          '/admin',
          '/employers',
          '/surveys',
          '/api/',
        ],
      },
      {
        // Block AI training crawlers
        userAgent: ['GPTBot', 'Google-Extended', 'CCBot', 'anthropic-ai', 'Claude-Web'],
        disallow: ['/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
