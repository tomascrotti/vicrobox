const STATS = [
  { value: '+500', label: 'Eventos realizados' },
  { value: '6+', label: 'Servicios disponibles' },
  { value: '100%', label: 'Clientes satisfechos' },
  { value: '24/7', label: 'Atención y soporte' },
]

export function StatsStrip() {
  return (
    <section className="bg-s1 border-y border-white/8 py-14 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {STATS.map(({ value, label }) => (
          <div key={label}>
            <p className="font-display text-4xl md:text-5xl text-orange mb-1.5">{value}</p>
            <p className="text-sm font-bold text-white/55 uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
