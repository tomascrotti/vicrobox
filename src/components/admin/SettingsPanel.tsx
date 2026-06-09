'use client'

import { useState } from 'react'
import { updateSetting } from '@/app/(admin)/admin/actions'

type Props = {
  whatsappNumber: string
  instagramUrl: string
  facebookUrl: string
}

type FieldState = { value: string; saving: boolean; saved: boolean; error: string | null }

function useField(initial: string) {
  const [state, setState] = useState<FieldState>({ value: initial, saving: false, saved: false, error: null })

  async function save(key: string) {
    setState((s) => ({ ...s, saving: true, error: null, saved: false }))
    const result = await updateSetting(key, state.value.trim())
    if (result.error) {
      setState((s) => ({ ...s, saving: false, error: result.error! }))
    } else {
      setState((s) => ({ ...s, saving: false, saved: true }))
      setTimeout(() => setState((s) => ({ ...s, saved: false })), 2500)
    }
  }

  return { state, setValue: (v: string) => setState((s) => ({ ...s, value: v, saved: false })), save }
}

function SettingRow({
  label,
  hint,
  settingKey,
  placeholder,
  inputMode,
  field,
}: {
  label: string
  hint?: string
  settingKey: string
  placeholder: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  field: ReturnType<typeof useField>
}) {
  return (
    <div className="bg-s2 rounded-2xl p-5 border border-white/8">
      <label className="block text-sm font-bold mb-1">{label}</label>
      {hint && <p className="text-xs text-white/40 mb-3">{hint}</p>}
      <div className="flex gap-2">
        <input
          type="text"
          inputMode={inputMode}
          value={field.state.value}
          onChange={(e) => field.setValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm font-mono text-white placeholder-white/25 outline-none focus:border-orange transition-colors"
        />
        <button
          onClick={() => field.save(settingKey)}
          disabled={field.state.saving}
          className="px-4 py-2.5 rounded-xl bg-orange text-white text-sm font-bold disabled:opacity-50 hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          {field.state.saving ? '…' : field.state.saved ? '✓' : 'Guardar'}
        </button>
      </div>
      {field.state.error && <p className="mt-2 text-xs text-red-400">{field.state.error}</p>}
    </div>
  )
}

export function SettingsPanel({ whatsappNumber, instagramUrl, facebookUrl }: Props) {
  const whatsapp  = useField(whatsappNumber)
  const instagram = useField(instagramUrl)
  const facebook  = useField(facebookUrl)

  return (
    <div className="max-w-lg space-y-4">
      <h2 className="text-lg font-bold mb-6">Configuración</h2>

      <SettingRow
        label="Número de WhatsApp"
        hint="Formato internacional sin espacios — ej. 5491112345678"
        settingKey="whatsapp_number"
        placeholder="5491112345678"
        inputMode="tel"
        field={whatsapp}
      />

      <SettingRow
        label="Instagram"
        hint="URL completa del perfil"
        settingKey="instagram_url"
        placeholder="https://instagram.com/vicrobox"
        field={instagram}
      />

      <SettingRow
        label="Facebook"
        hint="URL completa de la página"
        settingKey="facebook_url"
        placeholder="https://facebook.com/vicrobox"
        field={facebook}
      />
    </div>
  )
}
