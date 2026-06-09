import { getActiveEvents } from '@/lib/data/events'
import { GalleryGrid } from '@/components/public/GalleryGrid'

export default async function GaleriaPage() {
  const events = await getActiveEvents()

  return (
    <main className="min-h-screen bg-bg-main text-white">
      {/* Hero header */}
      <section className="px-6 md:px-12 pt-32 pb-16 border-b border-white/8">
        <div className="mx-auto max-w-[1200px]">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-white/40 hover:text-white transition-colors mb-8"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Volver al inicio
          </a>

          <span className="mb-4 inline-block rounded-full border border-teal/40 px-3.5 py-1.5 text-[11px] font-extrabold tracking-[0.18em] text-teal uppercase">
            Galería de Eventos
          </span>

          <h1 className="font-display text-4xl leading-tight md:text-6xl mb-4">
            Momentos que <span className="text-orange">no se</span><br />
            <span className="text-orange">olvidan</span>
          </h1>

          <p className="max-w-[480px] text-base font-medium leading-relaxed text-white/55">
            Cada evento es único. Explorá nuestra galería y encontrá inspiración para el tuyo.
          </p>
        </div>
      </section>

      {/* Gallery */}
      <section className="px-6 md:px-12 py-16">
        <div className="mx-auto max-w-[1200px]">
          {events.length === 0 ? (
            <p className="text-center text-white/30 py-20">Próximamente...</p>
          ) : (
            <GalleryGrid events={events} />
          )}
        </div>
      </section>
    </main>
  )
}
