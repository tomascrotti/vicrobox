'use client'

import { useId, useState, type FormEvent } from 'react'
import { buildWhatsAppURL } from '@/lib/whatsapp'
import type { QuoteFormData, Service } from '@/types'

type QuoteFormProps = {
  services: Service[]
  whatsappNumber: string
}

const inputClass =
  'w-full bg-bg-main border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-orange transition-colors'

export function QuoteForm({ services, whatsappNumber }: QuoteFormProps) {
  const formId = useId()
  const [name, setName] = useState('')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [date, setDate] = useState('')
  const [guests, setGuests] = useState<number | ''>('')
  const [location, setLocation] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function toggleService(serviceName: string) {
    setSelectedServices((prev) =>
      prev.includes(serviceName) ? prev.filter((s) => s !== serviceName) : [...prev, serviceName]
    )
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!name || selectedServices.length === 0 || !date || guests === '' || !location) {
      setError('Completá los campos obligatorios para continuar.')
      return
    }

    setError('')

    const data: QuoteFormData = {
      name,
      services: selectedServices,
      date,
      guests,
      location,
      message: message || undefined,
    }

    window.open(buildWhatsAppURL(whatsappNumber, data), '_blank')
  }

  return (
    <section id="cta" className="py-24 px-6 bg-s1">
      <div className="max-w-xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl text-center mb-3">Cotiza tu evento</h2>
        <p className="text-center text-white/55 mb-10">
          Contanos los detalles y te respondemos por WhatsApp con una propuesta a medida.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor={`${formId}-name`} className="block text-sm font-bold mb-2">
              Nombre *
            </label>
            <input
              id={`${formId}-name`}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <span className="block text-sm font-bold mb-2">Servicios *</span>
            <div className="flex flex-wrap gap-2">
              {services.map((service) => {
                const active = selectedServices.includes(service.name)
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => toggleService(service.name)}
                    aria-pressed={active}
                    className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${
                      active
                        ? 'bg-orange border-orange text-white'
                        : 'border-white/15 text-white/65 hover:border-white/40'
                    }`}
                  >
                    {service.name}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor={`${formId}-date`} className="block text-sm font-bold mb-2">
                Fecha del evento *
              </label>
              <input
                id={`${formId}-date`}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor={`${formId}-guests`} className="block text-sm font-bold mb-2">
                Cantidad de invitados *
              </label>
              <input
                id={`${formId}-guests`}
                type="number"
                min={1}
                value={guests}
                onChange={(e) => setGuests(e.target.value === '' ? '' : Number(e.target.value))}
                className={inputClass}
                placeholder="100"
              />
            </div>
          </div>

          <div>
            <label htmlFor={`${formId}-location`} className="block text-sm font-bold mb-2">
              Ubicación *
            </label>
            <input
              id={`${formId}-location`}
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={inputClass}
              placeholder="Ciudad, salón o dirección"
            />
          </div>

          <div>
            <label htmlFor={`${formId}-message`} className="block text-sm font-bold mb-2">
              Mensaje (opcional)
            </label>
            <textarea
              id={`${formId}-message`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className={inputClass}
              placeholder="Contanos más sobre tu evento"
            />
          </div>

          {error && <p className="text-sm font-bold text-red-400">{error}</p>}

          <button
            type="submit"
            className="w-full bg-orange text-white px-9 py-4 rounded-full text-base font-extrabold shadow-[0_0_28px_rgba(240,120,32,0.40)] hover:scale-[1.02] hover:bg-[#D96610] transition-all"
          >
            Enviar por WhatsApp
          </button>
        </form>
      </div>
    </section>
  )
}
