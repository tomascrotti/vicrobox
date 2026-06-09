import Link from 'next/link'
import { Wordmark } from '@/components/ui/Wordmark'
import { getSettings } from '@/lib/data/settings'

export async function Footer() {
  const settings = await getSettings()

  const contactLinks = [
    { label: 'Instagram', href: settings.instagram_url },
    { label: 'Facebook',  href: settings.facebook_url  },
  ]

  return (
    <footer className="bg-[#0A0A0A] border-t border-white/7 px-6 md:px-12 py-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">

        {/* Logo */}
        <Link href="/" className="font-display text-2xl flex-shrink-0">
          <Wordmark />
        </Link>

        {/* Slogan */}
        <p className="text-sm font-medium text-white/40 leading-snug flex-1">
          Entretenimiento y servicios fotográficos para todo tipo de eventos.
        </p>

        {/* Contacto */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-[11px] font-extrabold tracking-[0.14em] uppercase text-white/25 mr-3">Contacto</span>
          {contactLinks.map((link) =>
            link.href ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs font-bold text-white/50 hover:text-white border border-white/10 hover:border-white/30 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <span key={link.label} className="px-3 py-1.5 text-xs font-bold text-white/20 border border-white/6 rounded-lg">
                {link.label}
              </span>
            )
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-5 pt-4 border-t border-white/7">
        <p className="text-xs font-semibold text-white/18 text-center">
          © {new Date().getFullYear()} Vicrobox Entretenimiento. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}
