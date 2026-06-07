import Link from 'next/link'
import { getServiceIcon } from '@/lib/icons'
import type { Service } from '@/types'

type ServiceCardProps = {
  service: Service
}

export function ServiceCard({ service }: ServiceCardProps) {
  const Icon = getServiceIcon(service.icon)
  return (
    <Link
      href={`/servicios/${service.slug}`}
      className="group flex-shrink-0 w-72 bg-s2 rounded-3xl p-7 border border-white/8 hover:border-white/20 hover:-translate-y-1.5 transition-all"
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
        style={{ backgroundColor: `${service.color}1F`, color: service.color }}
      >
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="font-display text-xl mb-2 group-hover:text-orange transition-colors">{service.name}</h3>
      <p className="text-sm text-white/55 leading-relaxed line-clamp-3">{service.description}</p>
    </Link>
  )
}
