// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuoteForm } from '@/components/public/QuoteForm'
import type { Service } from '@/types'

const SERVICES: Service[] = [
  {
    id: '1',
    name: 'Fotocabina',
    slug: 'fotocabina',
    description: '',
    icon: 'camera',
    color: '#F07820',
    active: true,
    order: 1,
    created_at: '',
  },
  {
    id: '2',
    name: 'Cabina espejada',
    slug: 'cabina-espejada',
    description: '',
    icon: 'mirror',
    color: '#1A52C8',
    active: true,
    order: 2,
    created_at: '',
  },
]

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('QuoteForm', () => {
  it('muestra un botón por cada servicio activo', () => {
    render(<QuoteForm services={SERVICES} whatsappNumber="5491100000000" />)
    expect(screen.getByRole('button', { name: 'Fotocabina' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cabina espejada' })).toBeInTheDocument()
  })

  it('muestra un error si se envía sin completar campos obligatorios', async () => {
    const user = userEvent.setup()
    render(<QuoteForm services={SERVICES} whatsappNumber="5491100000000" />)

    await user.click(screen.getByRole('button', { name: 'Enviar por WhatsApp' }))

    expect(screen.getByText(/Completá los campos obligatorios/i)).toBeInTheDocument()
  })

  it('abre WhatsApp con los datos completados al enviar', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    const user = userEvent.setup()
    render(<QuoteForm services={SERVICES} whatsappNumber="5491100000000" />)

    await user.type(screen.getByLabelText(/Nombre/i), 'Ana García')
    await user.click(screen.getByRole('button', { name: 'Fotocabina' }))
    await user.type(screen.getByLabelText(/Fecha del evento/i), '2026-12-15')
    await user.type(screen.getByLabelText(/Cantidad de invitados/i), '100')
    await user.type(screen.getByLabelText(/Ubicación/i), 'Salón Versailles, CABA')
    await user.click(screen.getByRole('button', { name: 'Enviar por WhatsApp' }))

    expect(openSpy).toHaveBeenCalledTimes(1)
    const [url] = openSpy.mock.calls[0]
    expect(url as string).toMatch(/^https:\/\/wa\.me\/5491100000000\?text=/)
    expect(decodeURIComponent(url as string)).toContain('Ana García')
    expect(decodeURIComponent(url as string)).toContain('Fotocabina')
  })
})
