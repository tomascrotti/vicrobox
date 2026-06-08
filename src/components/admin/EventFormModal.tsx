'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createEvent, updateEvent, createEventType } from '@/app/(admin)/admin/actions'
import type { Event, EventTypeRecord, Service, EventImage } from '@/types'

type Props =
  | { mode: 'create'; event?: never; eventTypes: EventTypeRecord[]; availableServices: Service[]; onClose: () => void }
  | { mode: 'edit'; event: Event; eventTypes: EventTypeRecord[]; availableServices: Service[]; onClose: () => void }

type PendingUpload = { file: File; preview: string; serviceId: string | null }
type ExistingImage = EventImage & { markedForDeletion: boolean }

export function EventFormModal({ mode, event, eventTypes: initialTypes, availableServices, onClose }: Props) {
  const [name, setName] = useState(event?.name ?? '')
  const [description, setDescription] = useState(event?.description ?? '')
  const [date, setDate] = useState(event?.date ?? '')
  const [eventTypes, setEventTypes] = useState<EventTypeRecord[]>(initialTypes)
  const [eventTypeId, setEventTypeId] = useState<string>(event?.event_type_id ?? initialTypes[0]?.id ?? '')
  const [typeSearch, setTypeSearch] = useState(event?.event_type?.name ?? initialTypes[0]?.name ?? '')
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false)

  const existingServiceIds = (event?.services ?? []).map((s) => s.id)
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(existingServiceIds)
  const [activeImageTab, setActiveImageTab] = useState<string | null>(existingServiceIds[0] ?? null)

  const [existingImages, setExistingImages] = useState<ExistingImage[]>(
    (event?.images ?? []).map((img) => ({ ...img, markedForDeletion: false }))
  )
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // When services change, set active tab to first selected
  useEffect(() => {
    if (selectedServiceIds.length > 0 && !selectedServiceIds.includes(activeImageTab ?? '')) {
      setActiveImageTab(selectedServiceIds[0])
    }
    if (selectedServiceIds.length === 0) setActiveImageTab(null)
  }, [selectedServiceIds])

  const filteredTypes = eventTypes.filter((t) =>
    t.name.toLowerCase().includes(typeSearch.toLowerCase())
  )
  const canCreateType = typeSearch.trim() && !eventTypes.some((t) => t.name.toLowerCase() === typeSearch.trim().toLowerCase())

  function selectType(type: EventTypeRecord) {
    setEventTypeId(type.id)
    setTypeSearch(type.name)
    setTypeDropdownOpen(false)
  }

  async function handleCreateType() {
    const result = await createEventType(typeSearch.trim())
    if (result.error) { setError(result.error); return }
    const newType: EventTypeRecord = { id: result.id!, name: typeSearch.trim(), slug: '', created_at: '' }
    setEventTypes((prev) => [...prev, newType])
    selectType(newType)
  }

  function toggleService(serviceId: string) {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    )
  }

  function markImageForDeletion(imgId: string) {
    setExistingImages((prev) => prev.map((img) => img.id === imgId ? { ...img, markedForDeletion: true } : img))
  }

  function removeUpload(idx: number) {
    setPendingUploads((prev) => prev.filter((_, i) => i !== idx))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const newUploads: PendingUpload[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      serviceId: activeImageTab,
    }))
    setPendingUploads((prev) => [...prev, ...newUploads])
    e.target.value = ''
  }

  async function uploadFile(file: File): Promise<string> {
    const supabase = createClient()
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error: uploadError } = await supabase.storage.from('events-images').upload(path, file)
    if (uploadError) throw new Error(uploadError.message)
    const { data } = supabase.storage.from('events-images').getPublicUrl(path)
    return data.publicUrl
  }

  async function deleteStorageFile(url: string) {
    const supabase = createClient()
    const prefix = '/storage/v1/object/public/events-images/'
    const path = url.includes(prefix) ? url.split(prefix)[1] : null
    if (path) await supabase.storage.from('events-images').remove([path])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim()) { setError('El nombre es requerido'); return }
    if (!description.trim()) { setError('La descripción es requerida'); return }
    if (!eventTypeId) { setError('El tipo de evento es requerido'); return }
    if (mode === 'create' && pendingUploads.length === 0) { setError('Agregá al menos una imagen'); return }

    setUploading(true)
    try {
      // Upload new files
      const uploadedImages: Array<{ url: string; service_id: string | null; order: number }> = []
      for (let i = 0; i < pendingUploads.length; i++) {
        const url = await uploadFile(pendingUploads[i].file)
        uploadedImages.push({ url, service_id: pendingUploads[i].serviceId, order: i })
      }

      if (mode === 'create') {
        const result = await createEvent({
          name, description, event_type_id: eventTypeId, date: date || null,
          service_ids: selectedServiceIds,
          images: uploadedImages,
        })
        if (result.error) { setError(result.error); return }
      } else {
        // Delete marked existing images from storage
        const toDelete = existingImages.filter((img) => img.markedForDeletion)
        await Promise.all(toDelete.map((img) => deleteStorageFile(img.url)))

        const result = await updateEvent(event.id, {
          name, description, event_type_id: eventTypeId, date: date || null,
          service_ids: selectedServiceIds,
          delete_image_ids: toDelete.map((img) => img.id),
          new_images: uploadedImages,
        })
        if (result.error) { setError(result.error); return }
      }

      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setUploading(false)
    }
  }

  const visibleExisting = existingImages.filter((img) => !img.markedForDeletion)
  const tabImages = (svcId: string | null) => [
    ...visibleExisting.filter((img) => img.service_id === svcId),
    ...pendingUploads.filter((u) => u.serviceId === svcId),
  ]
  const tabs = selectedServiceIds.length > 0
    ? [{ id: null, label: 'General' }, ...selectedServiceIds.map((id) => ({ id, label: availableServices.find((s) => s.id === id)?.name ?? id }))]
    : [{ id: null, label: 'Imágenes' }]
  const currentTab = activeImageTab

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-lg bg-s2 rounded-[20px] border border-white/8 p-6 my-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl">{mode === 'create' ? 'Nuevo Evento' : 'Editar Evento'}</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors" aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-white/70">Nombre del evento</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="rounded-xl bg-s1 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-orange" placeholder="Ej: Casamiento García" />
          </div>

          {/* Type + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-sm font-bold text-white/70">Tipo de evento</label>
              <div className="relative">
                <input
                  type="text"
                  value={typeSearch}
                  onChange={(e) => { setTypeSearch(e.target.value); setTypeDropdownOpen(true) }}
                  onFocus={() => setTypeDropdownOpen(true)}
                  className="w-full rounded-xl bg-s1 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-orange"
                  placeholder="Tipo..."
                />
                {typeDropdownOpen && (filteredTypes.length > 0 || canCreateType) && (
                  <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-s1 border border-white/15 rounded-xl overflow-hidden shadow-xl">
                    {filteredTypes.map((t) => (
                      <button key={t.id} type="button" onClick={() => selectType(t)} className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-white/8 transition-colors">
                        {t.name}
                      </button>
                    ))}
                    {canCreateType && (
                      <button type="button" onClick={handleCreateType} className="w-full text-left px-4 py-2.5 text-sm text-orange font-bold hover:bg-white/8 transition-colors border-t border-white/8">
                        + Crear "{typeSearch.trim()}"
                      </button>
                    )}
                  </div>
                )}
              </div>
              {typeDropdownOpen && <div className="fixed inset-0 z-[9]" onClick={() => setTypeDropdownOpen(false)} />}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-white/70">Fecha <span className="text-white/40 font-normal">(opcional)</span></label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl bg-s1 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-orange" />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-white/70">Descripción</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} className="rounded-xl bg-s1 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-orange resize-none" placeholder="Contá cómo fue el evento..." />
          </div>

          {/* Services */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-white/70">Servicios brindados <span className="text-white/40 font-normal">(opcional)</span></label>
            <div className="flex flex-wrap gap-2">
              {availableServices.map((svc) => {
                const selected = selectedServiceIds.includes(svc.id)
                return (
                  <button key={svc.id} type="button" onClick={() => toggleService(svc.id)}
                    className={`rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-colors border ${
                      selected ? 'bg-orange border-orange text-white' : 'border-white/16 text-white/60 hover:border-white/40'
                    }`}
                  >
                    {svc.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Images — tabbed by service */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-white/70">Imágenes</label>
            <div className="flex gap-1 border-b border-white/10 mb-2">
              {tabs.map((tab) => (
                <button key={tab.id ?? 'general'} type="button" onClick={() => setActiveImageTab(tab.id)}
                  className={`px-3 py-1.5 text-[12px] font-bold transition-colors border-b-2 -mb-px ${
                    currentTab === tab.id ? 'border-orange text-white' : 'border-transparent text-white/40 hover:text-white/70'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex flex-wrap gap-2 min-h-[80px]">
              {/* Existing images for this tab */}
              {visibleExisting.filter((img) => img.service_id === currentTab).map((img) => (
                <div key={img.id} className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10 group">
                  <img src={img.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <button type="button" onClick={() => markImageForDeletion(img.id)}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Eliminar imagen"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                    </svg>
                  </button>
                </div>
              ))}
              {/* Pending uploads for this tab */}
              {pendingUploads.map((u, idx) => u.serviceId === currentTab ? (
                <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-orange/40 group">
                  <img src={u.preview} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <button type="button" onClick={() => removeUpload(idx)}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Quitar imagen"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : null)}
              {/* Upload button */}
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-lg border border-dashed border-white/20 flex items-center justify-center hover:border-white/40 text-white/30 hover:text-white/60 transition-colors flex-shrink-0"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFileChange} className="hidden" />
            <p className="text-[11px] text-white/30">Las imágenes del tab activo se asocian a ese servicio</p>
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
