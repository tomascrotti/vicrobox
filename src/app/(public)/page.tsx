import { Hero } from '@/components/public/Hero'
import { ServicesCarousel } from '@/components/public/ServicesCarousel'
import { WhyUs } from '@/components/public/WhyUs'
import { EventsCarousel } from '@/components/public/EventsCarousel'
import { QuoteForm } from '@/components/public/QuoteForm'
import { getActiveServices } from '@/lib/data/services'
import { getActiveEvents } from '@/lib/data/events'
import { getSettings } from '@/lib/data/settings'

export default async function HomePage() {
  const [services, events, settings] = await Promise.all([
    getActiveServices(),
    getActiveEvents(),
    getSettings(),
  ])

  return (
    <>
      <Hero />

      <section
        id="servicios"
        className="px-6 py-[100px]"
        style={{
          backgroundImage: `linear-gradient(rgba(28,23,15,0.65),rgba(28,23,15,0.65)), url('${settings.services_bg_url}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="mx-auto max-w-[1200px]">
          <span className="mb-2.5 block text-[11px] font-extrabold tracking-[0.22em] text-teal uppercase">Nuestros Servicios</span>
          <h2 className="mb-3.5 font-display text-3xl leading-tight md:text-4xl">Todo lo que necesitas<br />para tu evento</h2>
          <p className="mb-13 max-w-[520px] text-base font-medium leading-relaxed text-white/55">
            Desde fotocabinas profesionales hasta instalaciones de luz LED, tenemos todo para hacer brillar tu celebración.
          </p>
          <ServicesCarousel services={services} />
        </div>
      </section>

      <WhyUs />

      <section
        id="eventos-destacados"
        className="px-6 py-[100px]"
        style={{
          backgroundImage: `linear-gradient(rgba(28,23,15,0.65),rgba(28,23,15,0.65)), url('${settings.events_bg_url}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="mx-auto max-w-[1200px]">
          <span className="mb-2.5 block text-[11px] font-extrabold tracking-[0.22em] text-teal uppercase">Eventos Destacados</span>
          <h2 className="mb-3.5 font-display text-3xl leading-tight md:text-4xl">Momentos que ya<br />hicimos brillar</h2>
          <p className="mb-13 max-w-[520px] text-base font-medium leading-relaxed text-white/55">
            Te mostramos eventos reales desde las experiencias de nuestros clientes.
          </p>
          <EventsCarousel events={events} />
        </div>
      </section>

      <QuoteForm services={services} whatsappNumber={settings.whatsapp_number} />
    </>
  )
}
