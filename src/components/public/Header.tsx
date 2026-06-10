'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Wordmark } from '@/components/ui/Wordmark'

const NAV_LINK_CLASS =
  'hidden whitespace-nowrap text-sm font-bold text-white/70 transition-colors hover:text-white min-[760px]:inline'

export function Header() {
  const [solid, setSolid] = useState(false)

  useEffect(() => {
    function onScroll() { setSolid(window.scrollY > 40) }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 flex items-center justify-between gap-6 border-b px-6 py-4 transition-colors duration-200 md:px-12 ${
        solid ? 'border-white/8 bg-bg-main/90 backdrop-blur-md' : 'border-transparent bg-transparent'
      }`}
    >
      <Link href="/" className="flex flex-shrink-0 items-center font-display text-2xl" aria-label="Vicrobox — Inicio">
        <Wordmark />
      </Link>
      <nav className="flex items-center gap-6">
        <Link href="/servicios" className={NAV_LINK_CLASS}>Servicios</Link>
        <Link href="/galeria" className={NAV_LINK_CLASS}>Galería</Link>
        <Link href="/cotizar" className={NAV_LINK_CLASS}>Cotizar</Link>
        <Link
          href="/cotizar"
          className="rounded-full bg-orange px-5 py-2.5 text-sm font-extrabold whitespace-nowrap text-white shadow-[0_0_18px_rgba(234,124,3,0.30)] transition-all hover:scale-[1.03] hover:bg-[#D06B00]"
        >
          <span className="hidden min-[760px]:inline">Cotiza tu evento</span>
          <span className="inline min-[760px]:hidden">Cotiza</span>
        </Link>
      </nav>
    </header>
  )
}
