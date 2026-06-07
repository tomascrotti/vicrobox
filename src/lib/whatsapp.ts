// src/lib/whatsapp.ts
import type { QuoteFormData } from '@/types'

export function buildWhatsAppURL(phoneNumber: string, data: QuoteFormData): string {
  const lines = [
    `¡Hola! Quiero cotizar un servicio de Vicrobox 🎉`,
    ``,
    `*Nombre:* ${data.name}`,
    `*Servicios:* ${data.services.join(', ')}`,
    `*Fecha del evento:* ${data.date}`,
    `*Cantidad de invitados:* ${data.guests}`,
    `*Ubicación:* ${data.location}`,
  ]

  if (data.message) {
    lines.push(`*Mensaje adicional:* ${data.message}`)
  }

  const text = lines.join('\n')
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`
}
