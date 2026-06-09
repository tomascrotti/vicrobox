import { notFound } from 'next/navigation'
import { getServiceBySlug, getActiveServices } from '@/lib/data/services'
import { getActiveEvents } from '@/lib/data/events'

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [service, allServices, events] = await Promise.all([
    getServiceBySlug(slug),
    getActiveServices(),
    getActiveEvents(),
  ])

  if (!service) notFound()

  // Events that include this service
  const relatedEvents = events.filter((e) =>
    (e.services ?? []).some((s) => s.id === service.id)
  )

  const cover = (service.images?.find((i) => i.is_cover) ?? service.images?.[0])?.url

  return (
    <main className="min-h-screen bg-bg-main text-white">

      {/* ── Hero ────────────────────────────────────────────── */}
      <div className="relative w-full h-[50vh] min-h-[320px] overflow-hidden">
        {cover ? (
          <img src={cover} alt={service.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-s1" />
        )}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(12,12,16,0.15) 0%, rgba(12,12,16,0.5) 50%, rgba(12,12,16,0.98) 100%)' }}
        />
        <a
          href="/#servicios"
          className="absolute top-6 left-6 md:left-12 z-[60] flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Servicios
        </a>
      </div>

      {/* ── Name + description ─────────────────────────────── */}
      <section className="px-6 md:px-12 pt-8 pb-12 border-b border-white/8">
        <div className="mx-auto max-w-[1200px]">
          <span className="mb-3 block text-[11px] font-extrabold tracking-[0.22em] text-teal uppercase">
            Nuestros Servicios
          </span>
          <h1 className="font-display text-4xl leading-tight md:text-5xl mb-4">{service.name}</h1>
          {service.description && (
            <p className="max-w-2xl text-base font-medium leading-relaxed text-white/60">
              {service.description}
            </p>
          )}
        </div>
      </section>

      {/* ── Images grid ────────────────────────────────────── */}
      {service.images && service.images.length > 1 && (
        <section className="px-6 md:px-12 py-12 border-b border-white/8">
          <div className="mx-auto max-w-[1200px]">
            <p className="text-[11px] font-extrabold tracking-[0.18em] text-white/30 uppercase mb-6">Galería</p>
            <div className="columns-2 md:columns-3 gap-3 space-y-3">
              {service.images.slice(1).map((img) => (
                <img key={img.id} src={img.url} alt={service.name} className="w-full rounded-xl object-cover break-inside-avoid" loading="lazy" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Related events ─────────────────────────────────── */}
      {relatedEvents.length > 0 && (
        <section className="px-6 md:px-12 py-14">
          <div className="mx-auto max-w-[1200px]">
            <p className="text-[11px] font-extrabold tracking-[0.22em] text-teal uppercase mb-2">Eventos destacados</p>
            <h2 className="font-display text-2xl mb-8">Momentos con {service.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedEvents.map((event) => {
                const cover = event.images?.[0]?.url
                return (
                  <a
                    key={event.id}
                    href={`/eventos/${event.slug}`}
                    className="group flex flex-col bg-s2 rounded-[20px] overflow-hidden border border-white/7 hover:-translate-y-1 hover:border-white/20 transition-all duration-200"
                  >
                    <div className="relative h-[180px] overflow-hidden">
                      {cover ? (
                        <img src={cover} alt={event.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                      ) : (
                        <div className="absolute inset-0 bg-s1" />
                      )}
                    </div>
                    <div className="p-5">
                      {event.event_type && (
                        <span className="text-[11px] font-bold text-orange">{event.event_type.name}</span>
                      )}
                      <p className="font-display text-base mt-1 group-hover:text-orange transition-colors">{event.name}</p>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
