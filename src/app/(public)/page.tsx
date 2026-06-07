import { Hero } from '@/components/public/Hero'
import { ServicesCarousel } from '@/components/public/ServicesCarousel'
import { StatsStrip } from '@/components/public/StatsStrip'
import { WhyUs } from '@/components/public/WhyUs'
import { CTABanner } from '@/components/public/CTABanner'
import { QuoteForm } from '@/components/public/QuoteForm'
import { getActiveServices } from '@/lib/data/services'
import { getSettings } from '@/lib/data/settings'

export default async function HomePage() {
  const [services, settings] = await Promise.all([getActiveServices(), getSettings()])

  return (
    <>
      <Hero />
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl text-center mb-12">Nuestros servicios</h2>
          <ServicesCarousel services={services} />
        </div>
      </section>
      <StatsStrip />
      <WhyUs />
      <CTABanner />
      <QuoteForm services={services} whatsappNumber={settings.whatsapp_number} />
    </>
  )
}
