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

      <section id="servicios" className="section-bg-servicios px-6 py-[100px]">
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

      <section id="eventos-destacados" className="section-bg-eventos px-6 py-[100px]">
        <div className="mx-auto max-w-[1200px]">
          <span className="mb-2.5 block text-[11px] font-extrabold tracking-[0.22em] text-teal uppercase">Eventos Destacados</span>
          <h2 className="mb-3.5 font-display text-3xl leading-tight md:text-4xl">Momentos que ya<br />hicimos brillar</h2>
          <p className="mb-13 max-w-[520px] text-base font-medium leading-relaxed text-white/55">
            Una muestra de los eventos donde pusimos nuestro equipo, nuestra energía y muchas ganas de divertirnos.
          </p>
          <EventsCarousel events={events} />
        </div>
      </section>

      <QuoteForm services={services} whatsappNumber={settings.whatsapp_number} />
    </>
  )
}
