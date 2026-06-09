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
    <footer className="bg-[#0A0A0A] border-t border-white/7 px-6 md:px-12 pt-12 pb-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">

        {/* Logo + slogan */}
        <div>
          <Link href="/" className="font-display text-3xl flex items-center mb-3">
            <Wordmark />
          </Link>
          <p className="text-sm font-medium text-white/45 leading-relaxed max-w-[240px]">
            Entretenimiento y servicios fotográficos para todo tipo de eventos. Hacemos los momentos inolvidables.
          </p>
        </div>

        {/* Contacto — siempre visible */}
        <div>
          <p className="text-[11px] font-extrabold tracking-[0.16em] uppercase text-white/28 mb-3">Contacto</p>
          <div className="flex flex-col gap-2">
            {contactLinks.map((link) =>
              link.href ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-white/50 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <span key={link.label} className="text-sm font-semibold text-white/20">
                  {link.label}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 pt-5 border-t border-white/7">
        <p className="text-xs font-semibold text-white/20 text-center">
          © {new Date().getFullYear()} Vicrobox Entretenimiento. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}
