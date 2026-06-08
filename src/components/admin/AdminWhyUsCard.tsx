'use client'

import { useState } from 'react'
import { toggleWhyUsItemActive, deleteWhyUsItem } from '@/app/(admin)/admin/actions'
import { IconSvg } from '@/lib/icons'
import type { WhyUsItem } from '@/types'

export function AdminWhyUsCard({
  item,
  onEdit,
}: {
  item: WhyUsItem
  onEdit: () => void
}) {
  const [confirming, setConfirming] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleToggle() {
    setPending(true)
    await toggleWhyUsItemActive(item.id, !item.active)
    setPending(false)
  }

  async function handleDelete() {
    setPending(true)
    await deleteWhyUsItem(item.id)
    setPending(false)
    setConfirming(false)
  }

  return (
    <article className="flex flex-col bg-s2 rounded-[20px] border border-white/7 p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl bg-s1 border border-white/10 flex items-center justify-center">
          <IconSvg iconKey={item.icon_key} size={22} />
        </div>
        {!item.active && (
          <span className="rounded-full bg-yellow-400 px-2.5 py-1 text-[11px] font-extrabold text-black">Borrador</span>
        )}
      </div>

      <h3 className="font-display text-base leading-tight text-orange mb-2">{item.title}</h3>
      <p className="flex-1 text-sm text-white/55 leading-relaxed line-clamp-4 mb-4">{item.description}</p>

      {confirming ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-white/70">¿Eliminar <span className="font-bold text-white">{item.title}</span>?</p>
          <div className="flex gap-2">
            <button onClick={() => setConfirming(false)} className="flex-1 rounded-full border border-white/16 py-2 text-sm font-bold text-white/70 hover:border-white/32 transition-colors">Cancelar</button>
            <button onClick={handleDelete} disabled={pending} className="flex-1 rounded-full bg-red-600 py-2 text-sm font-bold text-white disabled:opacity-50 hover:bg-red-700 transition-colors">{pending ? '...' : 'Eliminar'}</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <button onClick={handleToggle} disabled={pending} className="rounded-full border border-white/16 px-3.5 py-1.5 text-[12px] font-bold text-white/70 hover:border-white/32 disabled:opacity-50 transition-colors">
            {item.active ? 'Despublicar' : 'Publicar'}
          </button>
          <div className="flex gap-1">
            <button onClick={onEdit} className="p-2 rounded-lg hover:bg-white/8 text-white/50 hover:text-white transition-colors" aria-label="Editar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button onClick={() => setConfirming(true)} className="p-2 rounded-lg hover:bg-white/8 text-white/50 hover:text-red-400 transition-colors" aria-label="Eliminar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </article>
  )
}
