import { getActiveServices } from '@/lib/data/services'
import { ServiceCard } from '@/components/public/ServiceCard'

export default async function ServiciosPage() {
  const services = await getActiveServices()

  return (
    <main className="min-h-screen bg-bg-main text-white">

      {/* ── Header ────────────────────────────────────────────── */}
      <section className="relative px-6 md:px-12 pt-24 pb-10 border-b border-white/8 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 5% 80%, rgba(240,120,32,0.10) 0%, transparent 55%), radial-gradient(ellipse at 95% 10%, rgba(20,200,180,0.07) 0%, transparent 50%)',
          }}
        />
        <div className="relative mx-auto max-w-[1200px]">
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

      {/* ── Grid ──────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-12">
        <div className="mx-auto max-w-[1200px]">
          {services.length === 0 ? (
            <p className="text-center text-white/30 py-20">Próximamente...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
