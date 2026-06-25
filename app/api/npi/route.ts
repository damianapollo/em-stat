import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { submitNpiForReview } from '@/lib/db/users'

const NPPES_URL = 'https://npiregistry.cms.hhs.gov/api/?version=2.1'

// EM taxonomy codes (ABEM-relevant)
const EM_TAXONOMY_CODES = [
  '207P00000X', // Emergency Medicine
  '207PE0004X', // Emergency Medicine - Emergency Medical Services
  '207PT0002X', // Emergency Medicine - Toxicology
  '207PS0010X', // Emergency Medicine - Sports Medicine
]

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { npi } = await request.json()
  if (!npi || !/^\d{10}$/.test(npi)) {
    return NextResponse.json({ error: 'NPI must be exactly 10 digits' }, { status: 400 })
  }

  // Query NPPES
  let npiData: unknown = null
  let isEm = false
  try {
    const res = await fetch(`${NPPES_URL}&number=${npi}&limit=1`)
    const json = await res.json()
    npiData = json

    const results = json?.results ?? []
    if (results.length > 0) {
      const taxonomies: { code: string; primary?: boolean }[] = results[0]?.taxonomies ?? []
      isEm = taxonomies.some(t => EM_TAXONOMY_CODES.includes(t.code))
    }
  } catch {
    // NPPES unreachable — still queue for manual review
  }

  await submitNpiForReview(user.id, npi, { npiData, isEm })

  // Auto-approve if clearly EM
  if (isEm) {
    await supabase
      .from('users')
      .update({ npi, verification_status: 'pending' })
      .eq('id', user.id)
    return NextResponse.json({
      message: 'Your NPI was verified as Emergency Medicine. Your account is pending final review.',
    })
  }

  await supabase
    .from('users')
    .update({ npi, verification_status: 'pending' })
    .eq('id', user.id)

  return NextResponse.json({
    message: 'Your NPI has been submitted. Admin review is required for non-EM specialties.',
  })
}
