import { getSettings } from '@/lib/data/settings'
import { Header } from '@/components/public/Header'
import { Footer } from '@/components/public/Footer'
import { WhatsAppFAB } from '@/components/public/WhatsAppFAB'
import { SeasonalOverlay } from '@/components/public/SeasonalOverlay'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSettings()

  return (
    <>
      <SeasonalOverlay theme={settings.active_theme} />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFAB phoneNumber={settings.whatsapp_number} />
    </>
  )
}
