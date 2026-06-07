// src/lib/__tests__/whatsapp.test.ts
import { describe, it, expect } from 'vitest'
import { buildWhatsAppURL } from '@/lib/whatsapp'

describe('buildWhatsAppURL', () => {
  const base: Parameters<typeof buildWhatsAppURL>[1] = {
    name: 'Ana García',
    services: ['Fotocabina', 'Stand de Glitter'],
    date: '2026-12-15',
    guests: 100,
    location: 'Salón Versailles, CABA',
  }

  it('genera una URL wa.me válida', () => {
    const url = buildWhatsAppURL('5491100000000', base)
    expect(url).toMatch(/^https:\/\/wa\.me\/5491100000000\?text=/)
  })

  it('incluye el nombre en el mensaje', () => {
    const url = buildWhatsAppURL('5491100000000', base)
    expect(decodeURIComponent(url)).toContain('Ana García')
  })

  it('incluye todos los servicios', () => {
    const url = buildWhatsAppURL('5491100000000', base)
    const decoded = decodeURIComponent(url)
    expect(decoded).toContain('Fotocabina')
    expect(decoded).toContain('Stand de Glitter')
  })

  it('incluye la fecha, invitados y ubicación', () => {
    const url = buildWhatsAppURL('5491100000000', base)
    const decoded = decodeURIComponent(url)
    expect(decoded).toContain('2026-12-15')
    expect(decoded).toContain('100')
    expect(decoded).toContain('Salón Versailles, CABA')
  })

  it('incluye mensaje adicional si se provee', () => {
    const url = buildWhatsAppURL('5491100000000', {
      ...base,
      message: 'Necesito decoración especial',
    })
    expect(decodeURIComponent(url)).toContain('Necesito decoración especial')
  })

  it('omite la sección de mensaje si no se provee', () => {
    const url = buildWhatsAppURL('5491100000000', base)
    expect(decodeURIComponent(url)).not.toContain('Mensaje adicional')
  })
})
