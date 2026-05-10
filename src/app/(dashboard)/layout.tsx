import DashboardShell from '@/components/features/DashboardShell'
import { getCachedSettings } from '@/actions/settings'
import { SettingsProvider } from '@/contexts/SettingsContext'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getCachedSettings()

  return (
    <SettingsProvider initialSettings={settings}>
      <DashboardShell>{children}</DashboardShell>
    </SettingsProvider>
  )
}
