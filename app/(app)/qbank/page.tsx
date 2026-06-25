import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { QBankConfigurator } from '@/components/exam/QBankConfigurator'

export const metadata: Metadata = { title: 'QBank' }

export default async function QBankPage() {
  const supabase = await createServerClient()
  const { data: topics } = await supabase
    .from('topics')
    .select('id, name, parent_id, exam_weight')
    .order('name')

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">QBank</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Configure your exam session — choose topics, length, and mode.
        </p>
      </div>
      <QBankConfigurator topics={topics ?? []} />
    </div>
  )
}
