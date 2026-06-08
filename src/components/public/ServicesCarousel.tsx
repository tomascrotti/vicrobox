'use client'

import { CardCarousel } from './CardCarousel'
import { ServiceCard } from './ServiceCard'
import type { Service } from '@/types'

export function ServicesCarousel({ services }: { services: Service[] }) {
  return (
    <CardCarousel
      items={services}
      getKey={(service) => service.id}
      renderCard={(service) => <ServiceCard service={service} />}
      ariaLabel="Carrusel de servicios"
    />
  )
}
