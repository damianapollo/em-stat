import type { Metadata } from 'next'
import { getCurrentUser } from '@/lib/db/users'
import { NpiVerificationForm } from '@/components/settings/NpiVerificationForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const { profile, auth } = await getCurrentUser()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{auth?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name</span>
            <span>{profile?.name ?? '—'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">NPI status</span>
            <Badge
              variant={
                profile?.verification_status === 'verified' ? 'success' :
                profile?.verification_status === 'pending' ? 'warning' :
                'secondary'
              }
            >
              {profile?.verification_status ?? 'unverified'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* NPI Verification */}
      {profile?.verification_status !== 'verified' && (
        <Card id="npi">
          <CardHeader>
            <CardTitle className="text-base">NPI Verification</CardTitle>
            <CardDescription>
              Submit your NPI number to unlock full QBank access. We verify against the NPPES database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NpiVerificationForm userId={profile?.id ?? auth!.id} currentNpi={profile?.npi} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
