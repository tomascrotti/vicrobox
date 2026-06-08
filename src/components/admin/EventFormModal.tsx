'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createEvent, updateEvent } from '@/app/(admin)/admin/actions'
import type { Event, EventType } from '@/types'

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'casamiento', label: 'Casamiento' },
  { value: 'cumpleaños', label: 'Cumpleaños' },
  { value: 'corporativo', label: 'Corporativo' },
  { value: 'otro', label: 'Otro' },
]

type Props =
  | { mode: 'create'; event?: never; onClose: () => void }
  | { mode: 'edit'; event: Event; onClose: () => void }

export function EventFormModal({ mode, event, onClose }: Props) {
  const [name, setName] = useState(event?.name ?? '')
  const [description, setDescription] = useState(event?.description ?? '')
  const [eventType, setEventType] = useState<EventType>(event?.event_type ?? 'otro')
  const [date, setDate] = useState(event?.date ?? '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState(event?.images?.[0]?.url ?? '')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function uploadImage(file: File): Promise<string> {
    const supabase = createClient()
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error: uploadError } = await supabase.storage.from('events-images').upload(path, file)
    if (uploadError) throw new Error(uploadError.message)
    const { data } = supabase.storage.from('events-images').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim()) { setError('El nombre es requerido'); return }
    if (!description.trim()) { setError('La descripción es requerida'); return }
    if (mode === 'create' && !imageFile) { setError('La imagen es requerida'); return }

    setUploading(true)
    try {
      let imageUrl: string | undefined
      if (imageFile) imageUrl = await uploadImage(imageFile)

      const result = mode === 'create'
        ? await createEvent({ name, description, event_type: eventType, date: date || null, imageUrl: imageUrl! })
        : await updateEvent(event.id, { name, description, event_type: eventType, date: date || null, imageUrl })

      if (result.error) { setError(result.error); return }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-md bg-s2 rounded-[20px] border border-white/8 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl">{mode === 'create' ? 'Nuevo Evento' : 'Editar Evento'}</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors" aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-white/70">Nombre del evento</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="rounded-xl bg-s1 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-orange" placeholder="Ej: Casamiento García" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-white/70">Tipo</label>
              <select value={eventType} onChange={(e) => setEventType(e.target.value as EventType)} className="rounded-xl bg-s1 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-orange">
                {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-white/70">Fecha <span className="text-white/40 font-normal">(opcional)</span></label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl bg-s1 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-orange" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-white/70">Descripción</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} className="rounded-xl bg-s1 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-orange resize-none" placeholder="Contá cómo fue el evento..." />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-white/70">
              Imagen{mode === 'edit' && <span className="text-white/40 font-normal ml-1">(opcional)</span>}
            </label>
            <div className="relative rounded-xl border border-dashed border-white/20 overflow-hidden cursor-pointer hover:border-white/40 transition-colors" onClick={() => fileInputRef.current?.click()}>
              {imagePreview ? (
                <div className="relative h-36">
                  <img src={imagePreview} alt="Preview" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-sm font-bold text-white">Cambiar imagen</span>
                  </div>
                </div>
              ) : (
                <div className="h-36 flex flex-col items-center justify-center gap-2 text-white/40">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                  <span className="text-sm">Subir imagen</span>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-full border border-white/16 py-2.5 text-sm font-bold text-white/70 hover:border-white/32 transition-colors">Cancelar</button>
            <button type="submit" disabled={uploading} className="flex-1 rounded-full bg-orange py-2.5 text-sm font-extrabold text-white disabled:opacity-50 hover:bg-[#D06B00] transition-colors">
              {uploading ? 'Guardando...' : mode === 'create' ? 'Crear evento' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
