'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { Service } from '@/types'

export function ServiceCard({ service }: { service: Service }) {
  const [hovered, setHovered] = useState(false)
  const coverImg = (service.images?.find((i) => i.is_cover) ?? service.images?.[0])?.url
  const c = service.color ?? '#F07820'

  return (
    <Link
      href={`/servicios/${service.slug}`}
      className="group flex flex-col rounded-[20px] overflow-hidden transition-all duration-300 hover:-translate-y-1.5"
      style={{
        background: 'rgba(30,27,36,1)',
        border: `1.5px solid ${hovered ? c + '60' : c + '28'}`,
        boxShadow: hovered ? `0 8px 32px ${c}30` : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Accent line */}
      <div
        className="h-[3px] w-full flex-shrink-0"
        style={{ background: `linear-gradient(90deg, ${c}, ${c}44)` }}
      />

      {/* Image / fallback */}
      <div className="relative h-[200px] overflow-hidden">
        {coverImg ? (
          <>
            <img
              src={coverImg}
              alt={service.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(12,12,16,0.6) 0%, transparent 60%)' }}
            />
          </>
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: `linear-gradient(160deg, ${c}cc 0%, ${c}55 40%, rgba(18,16,22,1) 80%)`,
            }}
          >
            <span className="text-5xl opacity-20 select-none">✦</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 pb-7 flex-1 flex flex-col">
        <p
          className="font-bold text-[11px] tracking-[0.14em] uppercase mb-1.5"
          style={{ color: c }}
        >
          {service.tagline || service.name}
        </p>
        <h2 className="font-display text-xl mb-2">{service.name}</h2>
        {service.description && (
          <p className="text-white/50 text-sm leading-relaxed line-clamp-2 flex-1">
            {service.description}
          </p>
        )}
        <span
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold transition-all duration-200 group-hover:gap-2.5"
          style={{ color: c }}
        >
          Ver detalle
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  )
}
