'use client'

import { useState } from 'react'
import { updateSetting } from '@/app/(admin)/admin/actions'

export function SettingsPanel({ whatsappNumber }: { whatsappNumber: string }) {
  const [phone, setPhone] = useState(whatsappNumber)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)
    const result = await updateSetting('whatsapp_number', phone.trim())
    setSaving(false)
    if (result.error) {
      setError(result.error)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  return (
    <div className="max-w-lg">
      <h2 className="text-lg font-bold mb-6">Configuración</h2>

      <div className="bg-s2 rounded-2xl p-6 border border-white/8">
        <label className="block text-sm font-bold mb-1">Número de WhatsApp</label>
        <p className="text-xs text-white/40 mb-3">
          Formato internacional sin espacios ni guiones — ej. <span className="font-mono text-white/60">5491112345678</span>
        </p>
        <input
          type="tel"
          value={phone}
          onChange={(e) => { setPhone(e.target.value); setSaved(false) }}
          placeholder="5491112345678"
          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm font-mono text-white placeholder-white/25 outline-none focus:border-orange transition-colors"
        />

        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-4 px-5 py-2.5 rounded-xl bg-orange text-white text-sm font-bold disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {saving ? 'Guardando…' : saved ? '✓ Guardado' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}
