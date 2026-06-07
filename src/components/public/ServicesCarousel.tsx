'use client'

import { useRef } from 'react'
import { ServiceCard } from './ServiceCard'
import type { Service } from '@/types'

type ServicesCarouselProps = {
  services: Service[]
}

export function ServicesCarousel({ services }: ServicesCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  function scrollByCard(direction: 1 | -1) {
    const track = trackRef.current
    if (!track) return
    track.scrollBy({ left: direction * 304, behavior: 'smooth' })
  }

  if (services.length === 0) return null

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {services.map((service) => (
          <div key={service.id} className="snap-start">
            <ServiceCard service={service} />
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-3 mt-6">
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          aria-label="Servicios anteriores"
          className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:border-white/40 transition-colors"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          aria-label="Siguientes servicios"
          className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:border-white/40 transition-colors"
        >
          ›
        </button>
      </div>
    </div>
  )
}
