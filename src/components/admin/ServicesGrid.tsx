'use client'

import { useState } from 'react'
import { AdminServiceCard } from './AdminServiceCard'
import { NewServiceCard } from './NewServiceCard'
import { ServiceFormModal } from './ServiceFormModal'
import { SectionBgEditor } from './SectionBgEditor'
import type { Service } from '@/types'

export function ServicesGrid({ services, bgUrl }: { services: Service[]; bgUrl: string }) {
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  return (
    <>
      <SectionBgEditor settingKey="services_bg_url" currentUrl={bgUrl} label="Nuestros Servicios" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {services.map((service) => (
          <AdminServiceCard
            key={service.id}
            service={service}
            onEdit={() => setEditingService(service)}
          />
        ))}
        <NewServiceCard onClick={() => setShowCreate(true)} />
      </div>

      {showCreate && (
        <ServiceFormModal mode="create" onClose={() => setShowCreate(false)} />
      )}

      {editingService && (
        <ServiceFormModal
          mode="edit"
          service={editingService}
          onClose={() => setEditingService(null)}
        />
      )}
    </>
  )
}
