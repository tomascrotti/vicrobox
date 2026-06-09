'use client'

import { useState } from 'react'
import type { Event } from '@/types'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=600&auto=format&fit=crop'

function GalleryCard({ event }: { event: Event }) {
  const cover = event.images?.[0]?.url ?? PLACEHOLDER
  const photoCount = event.images?.length ?? 0
  const services = event.services ?? []

  return (
    <a
      href={`/eventos/${event.slug}`}
      className="group flex flex-col bg-s2 rounded-[20px] overflow-hidden border border-white/7 hover:-translate-y-1 hover:border-white/20 transition-all duration-200"
    >
      {/* Image */}
      <div className="relative h-[220px] flex-shrink-0 overflow-hidden">
        <img
          src={cover}
          alt={event.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {/* Photo count badge */}
        {photoCount > 0 && (
          <span
            className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold text-white"
            style={{ background: 'rgba(12,12,16,0.65)', backdropFilter: 'blur(6px)' }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
            {photoCount} {photoCount === 1 ? 'foto' : 'fotos'}
          </span>
        )}
        {/* Bottom tags */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
          {event.event_type && (
            <span className="rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
              {event.event_type.name}
            </span>
          )}
          {services.slice(0, 2).map((s) => (
            <span key={s.id} className="rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-bold text-white/80 backdrop-blur-sm">
              {s.name}
            </span>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 p-5 pb-6">
        <p className="font-display text-base leading-tight text-white group-hover:text-orange transition-colors">
          {event.name}
        </p>
        {event.date && (
          <p className="text-[11px] font-bold text-white/35">
            {new Date(event.date).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
        <p className="text-sm text-white/50 leading-relaxed line-clamp-2">{event.description}</p>
      </div>
    </a>
  )
}

export function GalleryGrid({ events }: { events: Event[] }) {
  const [activeType, setActiveType] = useState<string | null>(null)

  const types = Array.from(
    new Map(
      events
        .filter((e) => e.event_type)
        .map((e) => [e.event_type!.id, e.event_type!])
    ).values()
  )

  const filtered = activeType
    ? events.filter((e) => e.event_type?.id === activeType)
    : events

  return (
    <div>
      {/* Filter pills */}
      {types.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            onClick={() => setActiveType(null)}
            className={`rounded-full px-4 py-2 text-[13px] font-bold transition-colors border ${
              activeType === null
                ? 'bg-orange border-orange text-white'
                : 'border-white/16 text-white/60 hover:border-white/40 hover:text-white'
            }`}
          >
            Todos
          </button>
          {types.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveType(activeType === t.id ? null : t.id)}
              className={`rounded-full px-4 py-2 text-[13px] font-bold transition-colors border ${
                activeType === t.id
                  ? 'bg-orange border-orange text-white'
                  : 'border-white/16 text-white/60 hover:border-white/40 hover:text-white'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-center text-white/30 py-20 text-sm">No hay eventos para este filtro.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((event) => (
            <GalleryCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}
