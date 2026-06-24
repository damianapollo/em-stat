import { MetadataRoute } from 'next'
import { createServerClient } from '@/lib/supabase/server'

// Reads live job data via Supabase (cookies) — must not run at build time.
export const dynamic = 'force-dynamic'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://em-stat.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createServerClient()

  // Static marketing pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/methodology`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/salary-explorer`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/advertise`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/legal/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/legal/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/legal/do-not-sell`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  // Active job listings
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, updated_at')
    .eq('is_active', true)
    .limit(500)

  const jobPages: MetadataRoute.Sitemap = (jobs ?? []).map(j => ({
    url: `${BASE_URL}/jobs/${j.id}`,
    lastModified: new Date(j.updated_at),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...jobPages]
}
