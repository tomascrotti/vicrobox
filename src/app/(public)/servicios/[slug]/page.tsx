import { notFound } from 'next/navigation'
import { getServiceBySlug } from '@/lib/data/services'
import { getActiveEvents } from '@/lib/data/events'
import { createClient } from '@/lib/supabase/server'
import { ServiceGallery } from '@/components/public/ServiceGallery'

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const [service, events] = await Promise.all([
    getServiceBySlug(slug),
    getActiveEvents(),
  ])

  if (!service) notFound()

  // Event images tagged to this service (from active events)
  const { data: rawEventImgs } = await supabase
    .from('event_images')
    .select('id, url, event:events(active)')
    .eq('service_id', service.id)

  const eventGalleryImages = (rawEventImgs ?? [])
    .filter((img: any) => img.event?.active)
    .map((img: any) => ({ id: img.id, url: img.url }))

  // Service's own non-cover images
  const cover = (service.images?.find((i) => i.is_cover) ?? service.images?.[0])?.url
  const ownGalleryImages = (service.images ?? [])
    .filter((i) => !i.is_cover)
    .map((i) => ({ id: i.id, url: i.url }))

  const galleryImages = [...ownGalleryImages, ...eventGalleryImages]

  // Events that include this service
  const relatedEvents = events.filter((e) =>
    (e.services ?? []).some((s) => s.id === service.id)
  )

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
      </div>

      {/* ── Name + description ─────────────────────────────── */}
      <section className="px-6 md:px-12 pt-8 pb-10 border-b border-white/8">
        <div className="mx-auto max-w-[1200px]">
          <a
            href="/servicios"
            className="mb-5 flex w-fit items-center gap-2 text-sm font-bold text-white/40 hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Servicios
          </a>
          <span className="mb-3 block text-[11px] font-extrabold tracking-[0.22em] text-teal uppercase">
            Nuestros Servicios
          </span>
          <h1 className="font-display text-4xl leading-tight md:text-5xl mb-3">{service.name}</h1>
          {service.tagline && (
            <p className="text-base font-medium mb-4" style={{ color: service.color }}>{service.tagline}</p>
          )}
          {service.description && (
            <p className="max-w-2xl text-base font-medium leading-relaxed text-white/60">
              {service.description}
            </p>
          )}

          {/* Stats bar */}
          {(service.base_price || service.duration || service.capacity || service.space_needed) && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
              {service.base_price && (
                <div className="bg-s2 rounded-2xl p-4 border border-white/8">
                  <span className="text-xl block mb-1">💰</span>
                  <p className="font-bold text-sm leading-tight">{service.base_price}</p>
                  <p className="text-[11px] text-white/40 mt-1">Precio base</p>
                </div>
              )}
              {service.duration && (
                <div className="bg-s2 rounded-2xl p-4 border border-white/8">
                  <span className="text-xl block mb-1">⏱</span>
                  <p className="font-bold text-sm leading-tight">{service.duration}</p>
                  <p className="text-[11px] text-white/40 mt-1">Duración</p>
                </div>
              )}
              {service.capacity && (
                <div className="bg-s2 rounded-2xl p-4 border border-white/8">
                  <span className="text-xl block mb-1">👥</span>
                  <p className="font-bold text-sm leading-tight">{service.capacity}</p>
                  <p className="text-[11px] text-white/40 mt-1">Capacidad</p>
                </div>
              )}
              {service.space_needed && (
                <div className="bg-s2 rounded-2xl p-4 border border-white/8">
                  <span className="text-xl block mb-1">📐</span>
                  <p className="font-bold text-sm leading-tight">{service.space_needed}</p>
                  <p className="text-[11px] text-white/40 mt-1">Espacio</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      {service.features && service.features.length > 0 && (
        <section className="px-6 md:px-12 py-10 border-b border-white/8">
          <div className="mx-auto max-w-[1200px]">
            <p className="text-[11px] font-extrabold tracking-[0.18em] text-white/30 uppercase mb-6">Características</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {service.features.map((f) => (
                <div key={f.id} className="flex items-start gap-4 bg-s2 rounded-2xl p-5 border border-white/8">
                  <span className="text-2xl flex-shrink-0 mt-0.5">{f.emoji}</span>
                  <div>
                    <p className="font-bold text-sm">{f.title}</p>
                    {f.description && <p className="text-white/50 text-sm mt-1">{f.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Gallery ────────────────────────────────────────── */}
      {galleryImages.length > 0 && (
        <section className="px-6 md:px-12 py-12 border-b border-white/8">
          <div className="mx-auto max-w-[1200px]">
            <p className="text-[11px] font-extrabold tracking-[0.18em] text-white/30 uppercase mb-6">
              Galería · {galleryImages.length} {galleryImages.length === 1 ? 'foto' : 'fotos'}
            </p>
            <ServiceGallery images={galleryImages} serviceName={service.name} />
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
                const eventCover = (event.images?.find((i) => i.is_cover) ?? event.images?.[0])?.url
                return (
                  <a
                    key={event.id}
                    href={`/eventos/${event.slug}`}
                    className="group flex flex-col bg-s2 rounded-[20px] overflow-hidden border border-white/7 hover:-translate-y-1 hover:border-white/20 transition-all duration-200"
                  >
                    <div className="relative h-[180px] overflow-hidden">
                      {eventCover ? (
                        <img src={eventCover} alt={event.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
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
