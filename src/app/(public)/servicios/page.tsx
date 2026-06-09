import { getActiveServices } from '@/lib/data/services'
import Link from 'next/link'

export default async function ServiciosPage() {
  const services = await getActiveServices()

  return (
    <main className="min-h-screen bg-bg-main text-white">
      <section className="px-6 md:px-12 pt-32 pb-16 border-b border-white/8">
        <div className="mx-auto max-w-[1200px]">
          <a
            href="/"
            className="mb-8 flex w-fit items-center gap-2 text-sm font-bold text-white/40 hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Volver al inicio
          </a>
          <span className="mb-4 inline-block rounded-full border border-teal/40 px-3.5 py-1.5 text-[11px] font-extrabold tracking-[0.18em] text-teal uppercase">
            Vicrobox
          </span>
          <h1 className="font-display text-4xl leading-tight md:text-6xl mb-4">
            Nuestros <span className="text-orange">Servicios</span>
          </h1>
          <p className="max-w-[480px] text-base font-medium leading-relaxed text-white/55">
            Todo lo que necesitás para hacer tu evento único e inolvidable.
          </p>
        </div>
      </section>

      <section className="px-6 md:px-12 py-16">
        <div className="mx-auto max-w-[1200px]">
          {services.length === 0 ? (
            <p className="text-center text-white/30 py-20">Próximamente...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => {
                const coverImg = (service.images?.find((i) => i.is_cover) ?? service.images?.[0])?.url
                return (
                  <Link
                    key={service.id}
                    href={`/servicios/${service.slug}`}
                    className="group flex flex-col bg-s2 rounded-[20px] overflow-hidden border border-white/7 hover:-translate-y-1 hover:border-white/20 transition-all duration-200"
                  >
                    <div className="relative h-[200px] overflow-hidden">
                      {coverImg ? (
                        <img src={coverImg} alt={service.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                      ) : (
                        <div className="absolute inset-0" style={{ backgroundColor: service.color + '33' }} />
                      )}
                    </div>
                    <div className="p-6 pb-7">
                      <p className="font-bold text-[11px] tracking-[0.14em] uppercase mb-1" style={{ color: service.color }}>
                        {service.tagline || service.name}
                      </p>
                      <h2 className="font-display text-xl mb-2">{service.name}</h2>
                      {service.description && (
                        <p className="text-white/55 text-sm leading-relaxed line-clamp-2">{service.description}</p>
                      )}
                      <span className="mt-4 inline-block text-sm font-bold transition-colors" style={{ color: service.color }}>
                        Ver detalle →
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
