import { getSettings } from '@/lib/data/settings'
import { Header } from '@/components/public/Header'
import { Footer } from '@/components/public/Footer'
import { WhatsAppFAB } from '@/components/public/WhatsAppFAB'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSettings()

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFAB phoneNumber={settings.whatsapp_number} />
    </>
  )
}
