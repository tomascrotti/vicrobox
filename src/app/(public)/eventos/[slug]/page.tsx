import { notFound } from 'next/navigation'
import { getEventBySlug } from '@/lib/data/events'
import type { Service } from '@/types'

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event) notFound()

  const allImages = event.images ?? []
  const services: Service[] = event.services ?? []

  const serviceGroups = services.map((svc) => ({
    service: svc,
    images: allImages.filter((img) => img.service_id === svc.id),
  }))
  const generalImages = allImages.filter(
    (img) => !img.service_id || !services.find((s) => s.id === img.service_id)
  )

  const cover = (allImages.find((i) => i.is_cover) ?? allImages[0])?.url

  return (
    <main className="min-h-screen bg-bg-main text-white">

      {/* ── Hero image full-width ─────────────────────────────── */}
      <div className="relative w-full h-[55vh] min-h-[360px] overflow-hidden">
        {cover ? (
          <img src={cover} alt={event.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-s1" />
        )}
        {/* Gradient: transparent top → dark bottom */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(12,12,16,0.2) 0%, rgba(12,12,16,0.5) 50%, rgba(12,12,16,0.98) 100%)' }} />

        {/* Back link */}
        <a
          href="/galeria"
          className="absolute top-6 left-6 md:left-12 z-[60] flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Galería
        </a>

        {/* Tags over image bottom-left */}
        <div className="absolute bottom-6 left-6 md:left-12 flex flex-wrap gap-2">
          {event.event_type && (
            <span className="rounded-full bg-orange px-3 py-1 text-[12px] font-extrabold text-white">
              {event.event_type.name}
            </span>
          )}
          {services.map((s) => (
            <span key={s.id} className="rounded-full bg-white/12 border border-white/20 px-3 py-1 text-[12px] font-bold text-white backdrop-blur-sm">
              {s.name}
            </span>
          ))}
        </div>
      </div>

      {/* ── Title + meta ─────────────────────────────────────── */}
      <section className="px-6 md:px-12 pt-8 pb-10 border-b border-white/8">
        <div className="mx-auto max-w-[1200px]">
          <h1 className="font-display text-4xl leading-tight md:text-5xl mb-5">
            {event.name}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm text-white/45 font-medium">
            {event.date && (
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                {new Date(event.date).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            )}
            {allImages.length > 0 && (
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
                {allImages.length} {allImages.length === 1 ? 'foto' : 'fotos'}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── Description + service pills ──────────────────────── */}
      {(event.description || services.length > 0) && (
        <section className="px-6 md:px-12 py-10 border-b border-white/8">
          <div className="mx-auto max-w-[1200px] flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            {event.description && (
              <p className="max-w-2xl text-base font-medium leading-relaxed text-white/65">
                {event.description}
              </p>
            )}
            {services.length > 0 && (
              <div className="flex flex-wrap gap-2 md:justify-end flex-shrink-0">
                {services.map((s) => (
                  <span key={s.id} className="rounded-full bg-white/8 border border-white/12 px-4 py-1.5 text-[13px] font-bold text-white/70">
                    {s.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Gallery ──────────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-14">
        <div className="mx-auto max-w-[1200px]">
          {serviceGroups.filter((g) => g.images.length > 0).map(({ service, images }) => (
            <div key={service.id} className="mb-14">
              <div className="flex items-center gap-3 mb-6">
                <span className="rounded-full bg-teal/12 border border-teal/25 px-3.5 py-1.5 text-[12px] font-extrabold text-teal">
                  {service.name}
                </span>
                <span className="text-[12px] text-white/30">{images.length} {images.length === 1 ? 'foto' : 'fotos'}</span>
              </div>
              <div className="columns-2 md:columns-3 gap-3 space-y-3">
                {images.map((img) => (
                  <img key={img.id} src={img.url} alt={`${event.name} — ${service.name}`} className="w-full rounded-xl object-cover break-inside-avoid" loading="lazy" />
                ))}
              </div>
            </div>
          ))}

          {generalImages.length > 0 && (
            <div className="mb-14">
              {serviceGroups.some((g) => g.images.length > 0) && (
                <p className="text-[11px] font-extrabold tracking-[0.18em] text-white/30 uppercase mb-6">General</p>
              )}
              <div className="columns-2 md:columns-3 gap-3 space-y-3">
                {generalImages.map((img) => (
                  <img key={img.id} src={img.url} alt={event.name} className="w-full rounded-xl object-cover break-inside-avoid" loading="lazy" />
                ))}
              </div>
            </div>
          )}

          {allImages.length === 0 && (
            <p className="text-center text-white/25 py-20 text-sm">Próximamente...</p>
          )}
        </div>
      </section>
    </main>
  )
}
