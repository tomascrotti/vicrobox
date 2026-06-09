import { notFound } from 'next/navigation'
import { getServiceBySlug } from '@/lib/data/services'
import { getActiveEvents } from '@/lib/data/events'
import { getSettings } from '@/lib/data/settings'
import { createClient } from '@/lib/supabase/server'
import { ServiceGallery } from '@/components/public/ServiceGallery'

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const [service, events, settings] = await Promise.all([
    getServiceBySlug(slug),
    getActiveEvents(),
    getSettings(),
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

  const cover = (service.images?.find((i) => i.is_cover) ?? service.images?.[0])?.url
  const ownGalleryImages = (service.images ?? [])
    .filter((i) => !i.is_cover)
    .map((i) => ({ id: i.id, url: i.url }))

  const galleryImages = [...ownGalleryImages, ...eventGalleryImages]

  const relatedEvents = events.filter((e) =>
    (e.services ?? []).some((s) => s.id === service.id)
  )

  const hasStats = !!(service.base_price || service.duration || service.capacity || service.space_needed)
  const hasFeatures = !!(service.features && service.features.length > 0)

  const whatsappHref = settings.whatsapp_number
    ? `https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola! Me interesa el servicio de ${service.name}`)}`
    : null

  return (
    <main className="min-h-screen bg-bg-main text-white">

      {/* ── Hero con título superpuesto ──────────────────────── */}
      <div className="relative w-full h-[55vh] min-h-[380px] overflow-hidden">
        {cover ? (
          <img src={cover} alt={service.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-s1" />
        )}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(12,12,16,0.2) 0%, rgba(12,12,16,0.4) 40%, rgba(12,12,16,0.95) 100%)' }}
        />

        {/* Contenido superpuesto */}
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-10">
          <div className="mx-auto max-w-[1200px]">
            <a
              href="/servicios"
              className="mb-5 flex w-fit items-center gap-2 text-sm font-bold text-white/50 hover:text-white transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Servicios
            </a>
            <span className="mb-2 block text-[11px] font-extrabold tracking-[0.22em] text-teal uppercase">
              Nuestros Servicios
            </span>
            <h1 className="font-display text-4xl leading-tight md:text-5xl mb-2">{service.name}</h1>
            {service.tagline && (
              <p className="text-base font-medium" style={{ color: service.color }}>{service.tagline}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Descripción (barra completa) ───────────────────────── */}
      {service.description && (
        <div className="border-b border-white/8 bg-s1/40">
          <div className="px-6 md:px-12 py-6 mx-auto max-w-[1200px]">
            <p className="text-[11px] font-extrabold tracking-[0.18em] text-white/30 uppercase mb-3">Descripción</p>
            <p className="max-w-2xl text-base font-medium leading-relaxed text-white/60">
              {service.description}
            </p>
          </div>
        </div>
      )}

      {/* ── Stats + características | Sidebar ──────────────────── */}
      {(hasStats || hasFeatures || service.base_price || whatsappHref) && (
        <section className="px-6 md:px-12 py-10 border-b border-white/8">
          <div className="mx-auto max-w-[1200px]">
            <div className="flex flex-col lg:flex-row gap-10 lg:items-start">

              {/* Columna principal */}
              <div className="flex-1 min-w-0">
                {hasStats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
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

                {hasFeatures && (
                  <div>
                    <p className="text-[11px] font-extrabold tracking-[0.18em] text-white/30 uppercase mb-5">Características</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {service.features!.map((f) => (
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
                )}
              </div>

              {/* Sidebar */}
              {(service.base_price || whatsappHref) && (
                <aside className="lg:w-[300px] flex-shrink-0">
                  <div className="bg-s2 rounded-2xl p-6 border border-white/8 lg:sticky lg:top-24">
                    {service.base_price && (
                      <div className="mb-6">
                        <p className="text-[10px] font-extrabold tracking-[0.2em] text-white/30 uppercase mb-1">Precio base</p>
                        <p className="font-display text-3xl leading-tight" style={{ color: service.color ?? '#F07820' }}>
                          {service.base_price}
                        </p>
                        <p className="text-xs text-white/30 mt-2">Precios sujetos a disponibilidad y duración.</p>
                      </div>
                    )}

                    <a
                      href={`/cotizar?servicio=${encodeURIComponent(service.name)}`}
                      className="block w-full text-center font-bold text-sm py-3 rounded-xl mb-3 transition-opacity hover:opacity-90"
                      style={{ backgroundColor: service.color ?? '#F07820', color: '#fff' }}
                    >
                      Solicitar cotización
                    </a>

                    {whatsappHref && (
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full text-center font-bold text-sm py-3 rounded-xl bg-[#25D366] text-white transition-opacity hover:opacity-90"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Consultar por WhatsApp
                      </a>
                    )}
                  </div>
                </aside>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Gallery ────────────────────────────────────────────── */}
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

      {/* ── Related events ─────────────────────────────────────── */}
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
