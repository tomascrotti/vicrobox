'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateSetting } from '@/app/(admin)/admin/actions'

type Props = {
  settingKey: 'services_bg_url' | 'events_bg_url' | 'whyus_bg_url'
  currentUrl: string
  label: string
}

export function SectionBgEditor({ settingKey, currentUrl, label }: Props) {
  const [preview, setPreview] = useState(currentUrl)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setSaved(false)
    setUploading(true)

    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `bg-${settingKey}-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('services-images')
        .upload(path, file, { upsert: true })
      if (uploadError) throw new Error(uploadError.message)

      const { data } = supabase.storage.from('services-images').getPublicUrl(path)
      const url = data.publicUrl

      const result = await updateSetting(settingKey, url)
      if (result.error) throw new Error(result.error)

      setPreview(url)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir imagen')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="mb-8 rounded-[16px] overflow-hidden border border-white/8 relative">
      {/* Background preview */}
      <div
        className="h-28 w-full relative"
        style={{
          backgroundImage: `linear-gradient(rgba(28,23,15,0.55),rgba(28,23,15,0.55)), url('${preview}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 flex items-center justify-between px-5">
          <div>
            <p className="text-[10px] font-extrabold tracking-[0.18em] text-teal uppercase mb-1">Fondo de sección</p>
            <p className="text-sm font-bold text-white">{label}</p>
          </div>
          <div className="flex items-center gap-2">
            {saved && (
              <span className="text-[12px] font-bold text-teal bg-black/40 px-3 py-1 rounded-full">
                ✓ Guardado
              </span>
            )}
            {error && (
              <span className="text-[12px] font-bold text-red-400 bg-black/40 px-3 py-1 rounded-full max-w-[200px] truncate">
                {error}
              </span>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 rounded-full bg-orange px-4 py-2 text-[12px] font-extrabold text-white disabled:opacity-50 hover:bg-[#D06B00] transition-colors"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
                  Subiendo...
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Cambiar imagen
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  )
}
