'use client'

import { useState } from 'react'
import { toggleServiceActive, deleteService } from '@/app/(admin)/admin/actions'
import type { Service } from '@/types'

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600&auto=format&fit=crop'

export function AdminServiceCard({
  service,
  onEdit,
}: {
  service: Service
  onEdit: () => void
}) {
  const [confirming, setConfirming] = useState(false)
  const [pending, setPending] = useState(false)
  const cover = service.images?.[0]?.url ?? PLACEHOLDER

  async function handleToggle() {
    setPending(true)
    await toggleServiceActive(service.id, !service.active)
    setPending(false)
  }

  async function handleDelete() {
    setPending(true)
    await deleteService(service.id, service.images?.[0]?.url)
    setPending(false)
    setConfirming(false)
  }

  return (
    <article className="flex flex-col bg-s2 rounded-[20px] overflow-hidden border border-white/7">
      <div className="relative h-[200px] flex-shrink-0 overflow-hidden">
        <img
          src={cover}
          alt={service.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {!service.active && (
          <span className="absolute top-3 right-3 rounded-full bg-yellow px-2.5 py-1 text-[11px] font-extrabold text-black">
            Borrador
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="font-display text-base leading-tight" style={{ color: service.color }}>
          {service.name}
        </p>
        <p className="flex-1 text-sm text-white/55 leading-relaxed line-clamp-3">
          {service.description}
        </p>
      </div>

      {confirming ? (
        <div className="px-5 pb-5 flex flex-col gap-3">
          <p className="text-sm text-white/70">
            ¿Eliminar <span className="font-bold text-white">{service.name}</span>? Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 rounded-full border border-white/16 py-2 text-sm font-bold text-white/70 hover:border-white/32 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={pending}
              className="flex-1 rounded-full bg-red-600 py-2 text-sm font-bold text-white disabled:opacity-50 hover:bg-red-700 transition-colors"
            >
              {pending ? '...' : 'Eliminar'}
            </button>
          </div>
        </div>
      ) : (
        <div className="px-5 pb-5 flex items-center justify-between gap-2">
          <button
            onClick={handleToggle}
            disabled={pending}
            className="rounded-full border border-white/16 px-3.5 py-1.5 text-[12px] font-bold text-white/70 hover:border-white/32 disabled:opacity-50 transition-colors"
          >
            {service.active ? 'Despublicar' : 'Publicar'}
          </button>
          <div className="flex gap-1">
            <button
              onClick={onEdit}
              className="p-2 rounded-lg hover:bg-white/8 text-white/50 hover:text-white transition-colors"
              aria-label="Editar servicio"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              onClick={() => setConfirming(true)}
              className="p-2 rounded-lg hover:bg-white/8 text-white/50 hover:text-red-400 transition-colors"
              aria-label="Eliminar servicio"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </article>
  )
}
