import Link from 'next/link'

export function CTABanner() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto rounded-[2.5rem] text-center px-8 py-16 bg-gradient-to-br from-orange to-yellow">
        <h2 className="font-display text-3xl md:text-4xl text-bg-main mb-3">¿Listo para hacer tu evento inolvidable?</h2>
        <p className="text-bg-main/70 font-semibold mb-8 max-w-md mx-auto">
          Contanos sobre tu celebración y armamos una propuesta a medida en minutos.
        </p>
        <Link
          href="#cotizar"
          className="inline-block bg-bg-main text-white px-9 py-4 rounded-full text-base font-extrabold shadow-[0_0_28px_rgba(13,13,13,0.35)] hover:scale-[1.04] transition-all"
        >
          ¡Cotiza tu evento!
        </Link>
      </div>
    </section>
  )
}
