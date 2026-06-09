import { getActiveServices } from '@/lib/data/services'
import { getSettings } from '@/lib/data/settings'
import { QuoteForm } from '@/components/public/QuoteForm'

export default async function CotizarPage() {
  const [services, settings] = await Promise.all([
    getActiveServices(),
    getSettings(),
  ])

  return (
    <main className="min-h-screen bg-bg-main text-white">
      <section className="px-6 md:px-12 pt-32 pb-24">
        <div className="mx-auto max-w-[700px]">
          <a
            href="/"
            className="mb-8 flex w-fit items-center gap-2 text-sm font-bold text-white/40 hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Volver al inicio
          </a>

          <span className="mb-3 block text-[11px] font-extrabold tracking-[0.22em] text-teal uppercase">
            Contacto
          </span>
          <h1 className="font-display text-4xl leading-tight md:text-5xl mb-3">
            Cotizá tu evento
          </h1>
          <p className="mb-10 text-base font-medium leading-relaxed text-white/55 max-w-[500px]">
            Contanos sobre tu evento y te respondemos por WhatsApp con una propuesta personalizada.
          </p>

          <QuoteForm services={services} whatsappNumber={settings.whatsapp_number} />
        </div>
      </section>
    </main>
  )
}
