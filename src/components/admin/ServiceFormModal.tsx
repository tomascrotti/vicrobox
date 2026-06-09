'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createService, updateService } from '@/app/(admin)/admin/actions'
import type { Service } from '@/types'

type Props =
  | { mode: 'create'; service?: never; onClose: () => void }
  | { mode: 'edit'; service: Service; onClose: () => void }

type GalleryImage = { id: string; url: string; markedForDeletion: boolean }
type PendingGallery = { file: File; preview: string }
type Feature = { emoji: string; title: string; description: string }

export function ServiceFormModal({ mode, service, onClose }: Props) {
  // Basic
  const [name, setName] = useState(service?.name ?? '')
  const [description, setDescription] = useState(service?.description ?? '')
  const [color, setColor] = useState(service?.color ?? '#F07820')
  const [order, setOrder] = useState(service?.order ?? 0)

  // Details
  const [basePrice, setBasePrice] = useState(service?.base_price ?? '')
  const [duration, setDuration] = useState(service?.duration ?? '')
  const [capacity, setCapacity] = useState(service?.capacity ?? '')
  const [spaceNeeded, setSpaceNeeded] = useState(service?.space_needed ?? '')

  // Features
  const [features, setFeatures] = useState<Feature[]>(
    service?.features?.map((f) => ({ emoji: f.emoji, title: f.title, description: f.description })) ?? []
  )

  // Cover image
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string>(
    service?.images?.find((i) => i.is_cover)?.url ?? service?.images?.[0]?.url ?? ''
  )
  const coverInputRef = useRef<HTMLInputElement>(null)

  // Gallery (edit only)
  const [galleryExisting, setGalleryExisting] = useState<GalleryImage[]>(
    mode === 'edit'
      ? (service?.images ?? []).filter((i) => !i.is_cover).map((i) => ({ id: i.id, url: i.url, markedForDeletion: false }))
      : []
  )
  const [pendingGallery, setPendingGallery] = useState<PendingGallery[]>([])
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Handlers ────────────────────────────────────────────

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  function handleGalleryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    setPendingGallery((prev) => [...prev, ...files.map((f) => ({ file: f, preview: URL.createObjectURL(f) }))])
    e.target.value = ''
  }

  function addFeature() {
    setFeatures((prev) => [...prev, { emoji: '✦', title: '', description: '' }])
  }

  function updateFeature(idx: number, field: keyof Feature, value: string) {
    setFeatures((prev) => prev.map((f, i) => i === idx ? { ...f, [field]: value } : f))
  }

  function removeFeature(idx: number) {
    setFeatures((prev) => prev.filter((_, i) => i !== idx))
  }

  async function uploadImage(file: File): Promise<string> {
    const supabase = createClient()
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error: uploadError } = await supabase.storage.from('services-images').upload(path, file)
    if (uploadError) throw new Error(uploadError.message)
    const { data } = supabase.storage.from('services-images').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim()) { setError('El nombre es requerido'); return }
    if (!description.trim()) { setError('La descripción es requerida'); return }
    if (mode === 'create' && !coverFile) { setError('La imagen de portada es requerida'); return }

    setUploading(true)
    try {
      let newCoverUrl: string | undefined
      if (coverFile) newCoverUrl = await uploadImage(coverFile)

      const galleryUrls: string[] = []
      for (const p of pendingGallery) galleryUrls.push(await uploadImage(p.file))

      const validFeatures = features.filter((f) => f.title.trim())

      const result =
        mode === 'create'
          ? await createService({ name, description, imageUrl: newCoverUrl!, color, order })
          : await updateService(service.id, {
              name, description, color, order,
              base_price: basePrice,
              duration,
              capacity,
              space_needed: spaceNeeded,
              features: validFeatures,
              newCoverUrl,
              deleteImageIds: galleryExisting.filter((i) => i.markedForDeletion).map((i) => i.id),
              newGalleryUrls: galleryUrls,
            })

      if (result.error) { setError(result.error); return }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setUploading(false)
    }
  }

  const sectionLabel = 'text-[11px] font-extrabold tracking-[0.16em] text-white/35 uppercase mb-3 mt-2'
  const inputClass = 'rounded-xl bg-s1 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-orange'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-lg bg-s2 rounded-[20px] border border-white/8 p-6 my-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl">{mode === 'create' ? 'Nuevo Servicio' : 'Editar Servicio'}</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors" aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-h-[75vh] overflow-y-auto pr-1">

          {/* ── Info básica ── */}
          <p className={sectionLabel}>Info básica</p>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-white/70">Nombre</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} placeholder="Ej: Cabina Espejada" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-white/70">Descripción</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3}
              className={`${inputClass} resize-none`} placeholder="Describí el servicio..." />
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm font-bold text-white/70">Color</label>
              <div className="flex items-center gap-3 rounded-xl bg-s1 border border-white/10 px-4 py-3">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0" />
                <span className="text-sm font-mono text-white/60">{color}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 w-28">
              <label className="text-sm font-bold text-white/70">Posición</label>
              <input type="number" min={0} value={order} onChange={(e) => setOrder(Number(e.target.value))} className={inputClass} />
            </div>
          </div>

          {/* ── Detalles ── */}
          <p className={sectionLabel}>Detalles del servicio <span className="text-white/20 normal-case tracking-normal font-normal">(opcional)</span></p>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-white/70">💰 Precio base</label>
              <input type="text" value={basePrice} onChange={(e) => setBasePrice(e.target.value)}
                className={inputClass} placeholder="desde $120.000" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-white/70">⏱ Duración</label>
              <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)}
                className={inputClass} placeholder="4 a 6 horas" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-white/70">👥 Capacidad</label>
              <input type="text" value={capacity} onChange={(e) => setCapacity(e.target.value)}
                className={inputClass} placeholder="hasta 250 personas" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-white/70">📐 Espacio</label>
              <input type="text" value={spaceNeeded} onChange={(e) => setSpaceNeeded(e.target.value)}
                className={inputClass} placeholder="3×3 metros" />
            </div>
          </div>

          {/* ── Características ── */}
          <p className={sectionLabel}>Características <span className="text-white/20 normal-case tracking-normal font-normal">(opcional)</span></p>

          <div className="flex flex-col gap-2">
            {features.map((f, idx) => (
              <div key={idx} className="flex gap-2 items-start bg-s1 rounded-xl p-3 border border-white/8">
                <input
                  type="text" value={f.emoji}
                  onChange={(e) => updateFeature(idx, 'emoji', e.target.value)}
                  className="w-12 text-center rounded-lg bg-white/8 border border-white/10 py-2 text-lg outline-none focus:border-orange flex-shrink-0"
                  maxLength={2}
                  title="Emoji"
                />
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <input
                    type="text" value={f.title} placeholder="Título"
                    onChange={(e) => updateFeature(idx, 'title', e.target.value)}
                    className="rounded-lg bg-white/8 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-orange w-full"
                  />
                  <input
                    type="text" value={f.description} placeholder="Slogan / descripción corta"
                    onChange={(e) => updateFeature(idx, 'description', e.target.value)}
                    className="rounded-lg bg-white/8 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-orange w-full"
                  />
                </div>
                <button type="button" onClick={() => removeFeature(idx)} className="text-white/30 hover:text-red-400 transition-colors mt-1 flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button" onClick={addFeature}
              className="flex items-center gap-2 text-sm font-bold text-white/40 hover:text-white transition-colors py-1"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Agregar característica
            </button>
          </div>

          {/* ── Portada ── */}
          <p className={sectionLabel}>Imagen de portada</p>

          <div className="flex flex-col gap-1.5">
            {mode === 'edit' && <p className="text-[11px] text-white/35">Dejá vacío para mantener la actual</p>}
            <div
              className="relative rounded-xl border border-dashed border-white/20 overflow-hidden cursor-pointer hover:border-white/40 transition-colors"
              onClick={() => coverInputRef.current?.click()}
            >
              {coverPreview ? (
                <div className="relative h-36">
                  <img src={coverPreview} alt="Preview" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-sm font-bold text-white">Cambiar portada</span>
                  </div>
                </div>
              ) : (
                <div className="h-36 flex flex-col items-center justify-center gap-2 text-white/40">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                  <span className="text-sm">Subir imagen de portada</span>
                </div>
              )}
            </div>
            <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverChange} className="hidden" />
          </div>

          {/* ── Galería ── */}
          {mode === 'edit' && (
            <>
              <p className={sectionLabel}>Galería adicional</p>
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2 min-h-[80px] p-3 rounded-xl bg-s1 border border-white/10">
                  {galleryExisting.filter((i) => !i.markedForDeletion).map((img) => (
                    <div key={img.id} className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10 group flex-shrink-0">
                      <img src={img.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      <button type="button"
                        onClick={() => setGalleryExisting((prev) => prev.map((i) => i.id === img.id ? { ...i, markedForDeletion: true } : i))}
                        className="absolute bottom-0 inset-x-0 bg-black/60 flex items-center justify-center py-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {pendingGallery.map((p, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-orange/40 group flex-shrink-0">
                      <img src={p.preview} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      <button type="button"
                        onClick={() => setPendingGallery((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute bottom-0 inset-x-0 bg-black/60 flex items-center justify-center py-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => galleryInputRef.current?.click()}
                    className="w-20 h-20 rounded-lg border border-dashed border-white/20 flex items-center justify-center hover:border-white/40 text-white/30 hover:text-white/60 transition-colors flex-shrink-0"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
                <input ref={galleryInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleGalleryChange} className="hidden" />
              </div>
            </>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-full border border-white/16 py-2.5 text-sm font-bold text-white/70 hover:border-white/32 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={uploading} className="flex-1 rounded-full bg-orange py-2.5 text-sm font-extrabold text-white disabled:opacity-50 hover:bg-[#D06B00] transition-colors">
              {uploading ? 'Guardando...' : mode === 'create' ? 'Crear servicio' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
