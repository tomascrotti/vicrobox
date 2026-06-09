import Link from 'next/link'
import { Wordmark } from '@/components/ui/Wordmark'

export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-white/7 px-6 md:px-12 pt-16 pb-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12">
        <div>
          <Link href="/" className="font-display text-3xl flex items-center mb-4">
            <Wordmark />
          </Link>
          <p className="text-sm font-medium text-white/55 leading-relaxed max-w-[230px]">
            Entretenimiento y servicios fotográficos para todo tipo de eventos. Hacemos los momentos
            inolvidables.
          </p>
        </div>
        <div>
          <p className="text-[11px] font-extrabold tracking-[0.16em] uppercase text-white/28 mb-4">Servicios</p>
          <div className="flex flex-col gap-2.5">
            <Link href="#servicios" className="text-sm font-semibold text-white/50 hover:text-white transition-colors">
              Fotocabinas
            </Link>
            <Link href="#servicios" className="text-sm font-semibold text-white/50 hover:text-white transition-colors">
              Stand de Glitter
            </Link>
            <Link href="#servicios" className="text-sm font-semibold text-white/50 hover:text-white transition-colors">
              Cabina Espejada
            </Link>
            <Link href="#servicios" className="text-sm font-semibold text-white/50 hover:text-white transition-colors">
              Túnel LED
            </Link>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-extrabold tracking-[0.16em] uppercase text-white/28 mb-4">Empresa</p>
          <div className="flex flex-col gap-2.5">
            <Link href="#eventos-destacados" className="text-sm font-semibold text-white/50 hover:text-white transition-colors">
              Eventos destacados
            </Link>
            <Link href="#cta" className="text-sm font-semibold text-white/50 hover:text-white transition-colors">
              Cotizar
            </Link>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-extrabold tracking-[0.16em] uppercase text-white/28 mb-4">Contacto</p>
          <div className="flex flex-col gap-2.5">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-white/50 hover:text-white transition-colors">
              Instagram
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-white/50 hover:text-white transition-colors">
              Facebook
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-9 pt-6 border-t border-white/7">
        <p className="text-xs font-semibold text-white/22 text-center">© {new Date().getFullYear()} Vicrobox Entretenimiento. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}
