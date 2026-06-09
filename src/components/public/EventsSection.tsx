'use client'

import { useState } from 'react'
import { CardCarousel } from './CardCarousel'
import { EventCard } from './EventCard'
import type { Event } from '@/types'

export function EventsSection({ events }: { events: Event[] }) {
  const [activeType, setActiveType] = useState<string | null>(null)
  const [activeService, setActiveService] = useState<string | null>(null)

  const types = Array.from(
    new Map(
      events
        .filter((e) => e.event_type)
        .map((e) => [e.event_type!.id, e.event_type!])
    ).values()
  )

  const services = Array.from(
    new Map(
      events
        .flatMap((e) => e.services ?? [])
        .map((s) => [s.id, s])
    ).values()
  )

  const filtered = events.filter((e) => {
    if (activeType && e.event_type?.id !== activeType) return false
    if (activeService && !(e.services ?? []).some((s) => s.id === activeService)) return false
    return true
  })

  const hasFilters = types.length > 0 || services.length > 0

  return (
    <div className="mx-auto max-w-[1200px]">
      {/* Header row: text left, filters right */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-13">
        {/* Left: labels */}
        <div className="flex-1 min-w-0">
          <span className="mb-2.5 block text-[11px] font-extrabold tracking-[0.22em] text-teal uppercase">
            Eventos Destacados
          </span>
          <h2 className="mb-3.5 font-display text-3xl leading-tight md:text-4xl">
            Momentos que ya<br />hicimos brillar
          </h2>
          <p className="max-w-[480px] text-base font-medium leading-relaxed text-white/55">
            Te mostramos eventos reales desde las experiencias de nuestros clientes.
          </p>
        </div>

        {/* Right: filter pills */}
        {hasFilters && (
          <div className="flex flex-col gap-3 md:items-end flex-shrink-0">
            {types.length > 0 && (
              <div className="flex flex-wrap gap-2 md:justify-end">
                <button
                  onClick={() => setActiveType(null)}
                  className={`rounded-full px-4 py-1.5 text-[12px] font-bold transition-colors border ${
                    activeType === null
                      ? 'bg-orange border-orange text-white'
                      : 'border-white/16 text-white/60 hover:border-white/40'
                  }`}
                >
                  Todos
                </button>
                {types.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveType(activeType === t.id ? null : t.id)}
                    className={`rounded-full px-4 py-1.5 text-[12px] font-bold transition-colors border ${
                      activeType === t.id
                        ? 'bg-orange border-orange text-white'
                        : 'border-white/16 text-white/60 hover:border-white/40'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            )}
            {services.length > 0 && (
              <div className="flex flex-wrap gap-2 md:justify-end">
                <button
                  onClick={() => setActiveService(null)}
                  className={`rounded-full px-4 py-1.5 text-[12px] font-bold transition-colors border ${
                    activeService === null
                      ? 'bg-teal border-teal text-white'
                      : 'border-white/16 text-white/60 hover:border-white/40'
                  }`}
                >
                  Todos los servicios
                </button>
                {services.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveService(activeService === s.id ? null : s.id)}
                    className={`rounded-full px-4 py-1.5 text-[12px] font-bold transition-colors border ${
                      activeService === s.id
                        ? 'bg-teal border-teal text-white'
                        : 'border-white/16 text-white/60 hover:border-white/40'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Carousel */}
      {filtered.length === 0 ? (
        <p className="text-center text-white/40 py-12 text-sm">No hay eventos para este filtro.</p>
      ) : (
        <CardCarousel
          items={filtered}
          getKey={(event) => event.id}
          renderCard={(event) => <EventCard event={event} />}
          ariaLabel="Carrusel de eventos destacados"
        />
      )}
    </div>
  )
}
