import Link from 'next/link'

const SPARKLES = [
  { left: '7%', top: '28%', color: '#00B898', size: '18px', delay: '0s' },
  { left: '14%', top: '62%', color: '#00B898', size: '12px', delay: '1.3s' },
  { left: '23%', top: '44%', color: '#F5C420', size: '14px', delay: '2.6s' },
  { left: '48%', top: '18%', color: '#F07820', size: '13px', delay: '0.5s' },
  { left: '77%', top: '28%', color: '#00B898', size: '16px', delay: '0.9s' },
  { left: '86%', top: '55%', color: '#28C44A', size: '12px', delay: '2.0s' },
  { left: '92%', top: '38%', color: '#F5C420', size: '11px', delay: '3.2s' },
  { left: '36%', top: '78%', color: '#00B898', size: '10px', delay: '1.7s' },
  { left: '65%', top: '72%', color: '#1A52C8', size: '11px', delay: '0.3s' },
]

const PRE_LETTERS = [
  { letter: 'V', color: '#F07820' },
  { letter: 'I', color: '#F5C420' },
  { letter: 'C', color: '#28C44A' },
  { letter: 'R', color: '#F07820' },
  { letter: 'O', color: '#1A52C8' },
  { letter: 'B', color: '#00B898' },
]

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center text-center overflow-hidden px-6 pt-32 pb-20"
      style={{ background: 'radial-gradient(ellipse 80% 55% at 50% 65%, rgba(240,120,32,0.07) 0%, transparent 65%)' }}
    >
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {SPARKLES.map((s, i) => (
          <span
            key={i}
            className="absolute animate-[floatsp_5s_ease-in-out_infinite]"
            style={{
              left: s.left,
              top: s.top,
              color: s.color,
              fontSize: s.size,
              animationDelay: s.delay,
              filter: `drop-shadow(0 0 6px ${s.color}99)`,
            }}
          >
            ✦
          </span>
        ))}
      </div>

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
            <span className="absolute -top-[0.13em] -right-[0.14em] text-teal" style={{ fontSize: '0.27em', filter: 'drop-shadow(0 0 6px rgba(0,184,152,0.8))' }}>
              ✦
            </span>
          </span>
          <span style={{ color: '#F07820' }}>X</span>
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
            href="#cotizar"
            className="bg-orange text-white px-9 py-4 rounded-full text-base font-extrabold shadow-[0_0_28px_rgba(240,120,32,0.40)] hover:scale-[1.04] hover:shadow-[0_0_44px_rgba(240,120,32,0.55)] hover:bg-[#D96610] transition-all"
          >
            ¡Cotiza tu evento!
          </Link>
          <Link
            href="/servicios"
            className="text-white px-9 py-3.5 rounded-full text-base font-extrabold border-2 border-white/28 hover:border-white hover:bg-white/7 transition-all"
          >
            Ver servicios
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/20 text-[11px] font-bold tracking-[0.14em] uppercase animate-[bob_2s_ease-in-out_infinite]" aria-hidden="true">
        <svg width="16" height="22" viewBox="0 0 16 22" fill="none">
          <rect x="1" y="1" width="14" height="20" rx="7" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="7" r="2" fill="currentColor" opacity="0.55">
            <animate attributeName="cy" values="7;13;7" dur="1.8s" repeatCount="indefinite" />
          </circle>
        </svg>
        Scroll
      </div>
    </section>
  )
}
