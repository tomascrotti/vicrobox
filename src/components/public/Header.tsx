import Link from 'next/link'

const LETTER_COLORS = ['#F07820', '#F5C420', '#28C44A', '#F07820', '#1A52C8', '#00B898', '#F07820', '#F07820']
const WORDMARK = 'VICROBOX'

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 bg-bg-main/90 backdrop-blur-md border-b border-white/8">
      <Link href="/" className="font-display text-2xl flex items-center" aria-label="Vicrobox — Inicio">
        {WORDMARK.split('').map((letter, i) => (
          <span key={i} style={{ color: LETTER_COLORS[i] }}>
            {letter}
          </span>
        ))}
      </Link>
      <nav className="flex items-center gap-7">
        <Link href="/servicios" className="hidden sm:inline text-sm font-bold text-white/70 hover:text-white transition-colors">
          Servicios
        </Link>
        <Link href="/eventos" className="hidden sm:inline text-sm font-bold text-white/70 hover:text-white transition-colors">
          Eventos
        </Link>
        <Link
          href="/#cotizar"
          className="bg-orange text-white px-5 py-2.5 rounded-full text-sm font-extrabold shadow-[0_0_18px_rgba(240,120,32,0.30)] hover:bg-[#D96610] hover:scale-[1.03] transition-all"
        >
          Cotiza tu evento
        </Link>
      </nav>
    </header>
  )
}
