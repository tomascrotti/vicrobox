import Link from 'next/link'
import { SparkleField } from '@/components/public/SparkleField'

const PRE_LETTERS = [
  { letter: 'V', color: '#F8BD19' },
  { letter: 'I', color: '#F8BD19' },
  { letter: 'C', color: '#079684' },
  { letter: 'R', color: '#079684' },
  { letter: 'O', color: '#079684' },
  { letter: 'B', color: '#EA7C03' },
]

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center text-center overflow-hidden px-6 pt-32 pb-20"
      style={{ background: 'radial-gradient(ellipse 80% 55% at 50% 65%, rgba(240,120,32,0.07) 0%, transparent 65%)' }}
    >
      <SparkleField count={24} />

      <div className="relative z-10 max-w-3xl">
        <span className="block text-xs font-extrabold tracking-[0.24em] uppercase text-teal mb-5">
          Entretenimiento para eventos
        </span>

        <div className="font-display flex items-center justify-center gap-0 mb-1" style={{ fontSize: 'clamp(54px, 9vw, 90px)', lineHeight: 1 }} aria-label="Vicrobox">
          {PRE_LETTERS.map(({ letter, color }, i) => (
            <span key={i} style={{ color }}>
              {letter}
            </span>
          ))}
          <span className="relative inline-flex items-center" style={{ height: '1em' }}>
            <svg viewBox="0 0 90 90" style={{ width: '0.84em', height: '0.84em' }} aria-hidden="true">
              <circle cx="45" cy="45" r="44" fill="#111" />
              <circle cx="45" cy="45" r="42" fill="none" stroke="#222" strokeWidth="2" />
              <circle cx="45" cy="45" r="37" fill="#0A0A0A" />
              <circle cx="45" cy="45" r="33" fill="none" stroke="#1A1A1A" strokeWidth="1.5" />
              <circle cx="45" cy="45" r="27" fill="none" stroke="#161616" strokeWidth="1" />
              <circle cx="45" cy="45" r="21" fill="#060606" />
              <circle cx="45" cy="45" r="19" fill="none" stroke="#0F0F0F" strokeWidth="1" />
              <circle cx="45" cy="45" r="11" fill="#030303" />
              <ellipse cx="57" cy="30" rx="12" ry="10" fill="white" opacity="0.88" transform="rotate(-18 57 30)" />
              <ellipse cx="57" cy="30" rx="7" ry="5.5" fill="white" transform="rotate(-18 57 30)" />
              <circle cx="33" cy="58" r="2.5" fill="white" opacity="0.18" />
            </svg>
            <span
              className="absolute -top-[0.13em] -right-[0.14em] text-white"
              style={{ fontSize: '0.27em', filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.9))', animation: 'shutterflash 3.6s ease-in-out infinite' }}
            >
              ✦
            </span>
          </span>
          <span style={{ color: '#EA7C03' }}>X</span>
        </div>

        <p className="text-[13px] font-extrabold tracking-[0.30em] uppercase text-white/55 mb-8">Entretenimiento</p>

        <h1 className="font-extrabold leading-[1.1] tracking-tight mb-4" style={{ fontSize: 'clamp(30px, 4vw, 50px)' }}>
          Tu evento,
          <br />
          <em className="not-italic bg-gradient-to-r from-orange to-yellow bg-clip-text text-transparent">nuestro show</em>
        </h1>
        <p className="text-[17px] font-medium text-white/55 leading-relaxed max-w-lg mx-auto mb-10">
          Fotocabinas, cabinas espejadas, túnel LED y mucho más. Hacemos que cada momento de tu
          celebración sea único e inolvidable.
        </p>
        <div className="flex gap-3.5 justify-center flex-wrap">
          <Link
            href="#cta"
            className="bg-orange text-white px-9 py-4 rounded-full text-base font-extrabold shadow-[0_0_28px_rgba(240,120,32,0.40)] hover:scale-[1.04] hover:shadow-[0_0_44px_rgba(240,120,32,0.55)] hover:bg-[#D96610] transition-all"
          >
            ¡Cotiza tu evento!
          </Link>
          <Link
            href="#servicios"
            className="text-white px-9 py-3.5 rounded-full text-base font-extrabold border-2 border-white/28 hover:border-white hover:bg-white/7 transition-all"
          >
            Ver servicios
          </Link>
        </div>
      </div>

    </section>
  )
}
