import type { ActiveTheme } from '@/types'

type SeasonalOverlayProps = {
  theme: ActiveTheme
}

const THEME_DECOR: Record<Exclude<ActiveTheme, 'default'>, { emoji: string; className: string }> = {
  navidad: { emoji: '❄️', className: 'animate-[fall_12s_linear_infinite]' },
  halloween: { emoji: '🦇', className: 'animate-[float_9s_ease-in-out_infinite]' },
}

const POSITIONS = [
  { left: '6%', delay: '0s', size: '18px' },
  { left: '18%', delay: '2s', size: '14px' },
  { left: '32%', delay: '4s', size: '20px' },
  { left: '48%', delay: '1s', size: '16px' },
  { left: '64%', delay: '3s', size: '22px' },
  { left: '78%', delay: '5s', size: '15px' },
  { left: '90%', delay: '2.5s', size: '18px' },
]

export function SeasonalOverlay({ theme }: SeasonalOverlayProps) {
  if (theme === 'default') return null

  const decor = THEME_DECOR[theme]

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden" aria-hidden="true">
      {POSITIONS.map((pos, i) => (
        <span
          key={i}
          className={`absolute opacity-60 ${decor.className}`}
          style={{ left: pos.left, top: '-40px', fontSize: pos.size, animationDelay: pos.delay }}
        >
          {decor.emoji}
        </span>
      ))}
    </div>
  )
}
