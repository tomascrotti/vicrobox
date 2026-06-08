'use client'

import { useState } from 'react'
import { createWhyUsItem, updateWhyUsItem } from '@/app/(admin)/admin/actions'
import { ICON_DEFS, ICON_KEYS, IconSvg } from '@/lib/icons'
import type { WhyUsItem } from '@/types'

type Props =
  | { mode: 'create'; item?: never; onClose: () => void }
  | { mode: 'edit'; item: WhyUsItem; onClose: () => void }

export function WhyUsFormModal({ mode, item, onClose }: Props) {
  const [title, setTitle] = useState(item?.title ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [iconKey, setIconKey] = useState(item?.icon_key ?? 'star')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!title.trim()) { setError('El título es requerido'); return }
    if (!description.trim()) { setError('La descripción es requerida'); return }

    setSubmitting(true)
    try {
      const result = mode === 'create'
        ? await createWhyUsItem({ title, description, icon_key: iconKey })
        : await updateWhyUsItem(item.id, { title, description, icon_key: iconKey })

      if (result.error) { setError(result.error); return }
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-md bg-s2 rounded-[20px] border border-white/8 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl">{mode === 'create' ? 'Nuevo motivo' : 'Editar motivo'}</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors" aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-white/70">Título</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="rounded-xl bg-s1 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-orange" placeholder="Ej: Experiencia comprobada" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-white/70">Descripción</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} className="rounded-xl bg-s1 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-orange resize-none" placeholder="Explicá por qué es un punto fuerte..." />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-white/70">Ícono</label>
            <div className="grid grid-cols-5 gap-2">
              {ICON_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setIconKey(key)}
                  title={ICON_DEFS[key].label}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-colors ${
                    iconKey === key
                      ? 'border-orange bg-orange/10'
                      : 'border-white/10 bg-s1 hover:border-white/30'
                  }`}
                >
                  <IconSvg iconKey={key} size={20} color={iconKey === key ? '#F07820' : '#ffffff66'} />
                  <span className="text-[10px] text-white/40 leading-none">{ICON_DEFS[key].label}</span>
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-full border border-white/16 py-2.5 text-sm font-bold text-white/70 hover:border-white/32 transition-colors">Cancelar</button>
            <button type="submit" disabled={submitting} className="flex-1 rounded-full bg-orange py-2.5 text-sm font-extrabold text-white disabled:opacity-50 hover:bg-[#D06B00] transition-colors">
              {submitting ? 'Guardando...' : mode === 'create' ? 'Crear' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
