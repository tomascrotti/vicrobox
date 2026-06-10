import { getActiveServices } from '@/lib/data/services'
import { getSettings } from '@/lib/data/settings'
import { QuoteForm } from '@/components/public/QuoteForm'
import { SparkleField } from '@/components/public/SparkleField'

export default async function CotizarPage() {
  const [services, settings] = await Promise.all([
    getActiveServices(),
    getSettings(),
  ])

  return (
    <main className="relative min-h-screen bg-bg-main text-white overflow-hidden">

      {/* ── Ambient background ─────────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            'radial-gradient(ellipse at 0% 100%, rgba(240,120,32,0.13) 0%, transparent 50%)',
            'radial-gradient(ellipse at 100% 0%, rgba(20,200,180,0.09) 0%, transparent 45%)',
            'radial-gradient(ellipse at 50% 50%, rgba(240,120,32,0.04) 0%, transparent 70%)',
          ].join(', '),
        }}
      />

      {/* ── Decorative sparkles ────────────────────────────────── */}
      <SparkleField count={18} />

      <div className="relative px-6 md:px-12 pt-28 pb-20">
        <div className="mx-auto max-w-[680px]">

          {/* Back */}
          <a
            href="/"
            className="mb-8 flex w-fit items-center gap-2 text-sm font-bold text-white/35 hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Volver al inicio
          </a>

          {/* Header */}
          <span className="mb-3 block text-[11px] font-extrabold tracking-[0.22em] text-teal uppercase">
            Contacto
          </span>
          <h1 className="font-display text-4xl leading-tight md:text-5xl mb-3">
            Cotizá tu evento
          </h1>
          <p className="mb-10 text-base font-medium leading-relaxed text-white/50 max-w-[480px]">
            Contanos sobre tu evento y te respondemos por WhatsApp con una propuesta personalizada.
          </p>

          {/* Form card */}
          <div
            className="rounded-2xl p-7 md:p-9"
            style={{
              background: 'rgba(28,25,34,0.85)',
              border: '1.5px solid rgba(255,255,255,0.07)',
              boxShadow: '0 0 60px rgba(240,120,32,0.07), 0 0 0 0 transparent',
              backdropFilter: 'blur(4px)',
            }}
          >
            {/* Accent top line */}
            <div
              className="h-[2px] w-full rounded-full mb-8"
              style={{ background: 'linear-gradient(90deg, #F07820, #00C8B4, rgba(255,255,255,0))' }}
            />

            <QuoteForm
              services={services}
              whatsappNumber={settings.whatsapp_number}
              standalone
            />
          </div>
        </div>
      </div>
    </main>
  )
}
