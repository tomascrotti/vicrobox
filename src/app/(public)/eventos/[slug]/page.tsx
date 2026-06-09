import { notFound } from 'next/navigation'
import { getEventBySlug } from '@/lib/data/events'
import type { Service } from '@/types'

const OVERLAY = 'linear-gradient(to bottom, rgba(12,12,16,0.55) 0%, rgba(12,12,16,0.85) 60%, rgba(12,12,16,1) 100%)'

export default async function EventPage({ params }: { params: { slug: string } }) {
  const event = await getEventBySlug(params.slug)
  if (!event) notFound()

  const cover = event.images?.[0]?.url
  const allImages = event.images ?? []
  const services: Service[] = event.services ?? []

  // Group images by service_id for display
  const serviceGroups = services.map((svc) => ({
    service: svc,
    images: allImages.filter((img) => img.service_id === svc.id),
  }))
  const generalImages = allImages.filter((img) => !img.service_id || !services.find((s) => s.id === img.service_id))

  return (
    <main className="min-h-screen bg-bg-main text-white">
      {/* Hero */}
      <section
        className="relative px-6 pt-32 pb-16 md:px-12"
        style={cover ? {
          backgroundImage: `${OVERLAY}, url('${cover}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        } : { background: 'var(--color-s1)' }}
      >
        <div className="mx-auto max-w-[1200px]">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {event.event_type && (
              <span className="rounded-full bg-orange/90 px-3.5 py-1.5 text-[12px] font-extrabold text-white">
                {event.event_type.name}
              </span>
            )}
            {services.map((svc) => (
              <span key={svc.id} className="rounded-full bg-white/12 px-3.5 py-1.5 text-[12px] font-bold text-white/80 backdrop-blur-sm">
                {svc.name}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl leading-tight md:text-6xl mb-4 max-w-3xl">
            {event.event_type ? `${event.event_type.name} ` : ''}{event.name}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-5 text-sm text-white/55 mb-8">
            {event.date && (
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {new Date(event.date).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            )}
            {allImages.length > 0 && (
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                </svg>
                {allImages.length} {allImages.length === 1 ? 'foto' : 'fotos'}
              </span>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <p className="max-w-2xl text-base font-medium leading-relaxed text-white/70">
              {event.description}
            </p>
          )}
        </div>
      </section>

      {/* Gallery */}
      <section className="px-6 md:px-12 py-16">
        <div className="mx-auto max-w-[1200px]">
          {/* Per-service groups */}
          {serviceGroups.filter((g) => g.images.length > 0).map(({ service, images }) => (
            <div key={service.id} className="mb-14">
              <div className="flex items-center gap-3 mb-6">
                <span className="rounded-full bg-teal/15 border border-teal/30 px-3.5 py-1.5 text-[12px] font-extrabold text-teal">
                  {service.name}
                </span>
                <span className="text-sm text-white/30">{images.length} {images.length === 1 ? 'foto' : 'fotos'}</span>
              </div>
              <div className="columns-2 md:columns-3 gap-3 space-y-3">
                {images.map((img) => (
                  <img
                    key={img.id}
                    src={img.url}
                    alt={`${event.name} — ${service.name}`}
                    className="w-full rounded-xl object-cover break-inside-avoid"
                    loading="lazy"
                  />
                ))}
              </div>
            </div>
          ))}

          {/* General images (no service assigned) */}
          {generalImages.length > 0 && (
            <div className="mb-14">
              {serviceGroups.some((g) => g.images.length > 0) && (
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-sm font-bold text-white/40 uppercase tracking-wider">General</span>
                </div>
              )}
              <div className="columns-2 md:columns-3 gap-3 space-y-3">
                {generalImages.map((img) => (
                  <img
                    key={img.id}
                    src={img.url}
                    alt={event.name}
                    className="w-full rounded-xl object-cover break-inside-avoid"
                    loading="lazy"
                  />
                ))}
              </div>
            </div>
          )}

          {allImages.length === 0 && (
            <p className="text-center text-white/30 py-20 text-sm">Próximamente...</p>
          )}
        </div>
      </section>

      {/* Back link */}
      <div className="px-6 md:px-12 pb-20">
        <div className="mx-auto max-w-[1200px]">
          <a href="/#eventos-destacados" className="inline-flex items-center gap-2 text-sm font-bold text-white/40 hover:text-white transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Ver todos los eventos
          </a>
        </div>
      </div>
    </main>
  )
}
