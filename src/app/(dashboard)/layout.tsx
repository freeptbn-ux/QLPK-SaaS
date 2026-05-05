import DashboardShell from '@/components/features/DashboardShell'
import { getAllSettings } from '@/actions/settings'
import { SettingsProvider } from '@/contexts/SettingsContext'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getAllSettings()

  return (
    <SettingsProvider initialSettings={settings}>
      <DashboardShell>{children}</DashboardShell>
    </SettingsProvider>
  )
}
