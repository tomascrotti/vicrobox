'use client'

import { useState } from 'react'
import { AdminWhyUsCard } from './AdminWhyUsCard'
import { WhyUsFormModal } from './WhyUsFormModal'
import type { WhyUsItem } from '@/types'

export function WhyUsGrid({ items }: { items: WhyUsItem[] }) {
  const [editingItem, setEditingItem] = useState<WhyUsItem | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <AdminWhyUsCard key={item.id} item={item} onEdit={() => setEditingItem(item)} />
        ))}
        <button
          onClick={() => setShowCreate(true)}
          className="flex flex-col items-center justify-center gap-3 bg-s2/50 rounded-[20px] border border-dashed border-white/20 min-h-[200px] w-full hover:border-white/40 hover:bg-s2/70 transition-colors group"
        >
          <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/40 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-white/40 group-hover:text-white/70 transition-colors">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <span className="text-sm font-bold text-white/40 group-hover:text-white/70 transition-colors">Nuevo motivo</span>
        </button>
      </div>

      {showCreate && <WhyUsFormModal mode="create" onClose={() => setShowCreate(false)} />}
      {editingItem && <WhyUsFormModal mode="edit" item={editingItem} onClose={() => setEditingItem(null)} />}
    </>
  )
}
