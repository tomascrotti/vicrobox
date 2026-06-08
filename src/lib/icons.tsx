export type IconKey =
  | 'trophy' | 'clock' | 'star' | 'heart' | 'sparkles'
  | 'camera' | 'users' | 'shield' | 'check' | 'bolt'

export const ICON_DEFS: Record<IconKey, { label: string; d: string }> = {
  trophy: {
    label: 'Trofeo',
    d: 'M8 21h8M12 17v4M7 4h10v4a5 5 0 01-10 0V4zM7 6H4a2 2 0 002 5M17 6h3a2 2 0 01-2 5',
  },
  clock: {
    label: 'Reloj',
    d: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2',
  },
  star: {
    label: 'Estrella',
    d: 'M12 2l2.7 6.4L22 9.3l-5 4.7 1.4 7-6.4-3.5-6.4 3.5L7 14 2 9.3l7.3-.9z',
  },
  heart: {
    label: 'Corazón',
    d: 'M20.8 8.6c0 4.5-8.8 9.9-8.8 9.9S3.2 13.1 3.2 8.6a4.6 4.6 0 018.8-1.9 4.6 4.6 0 018.8 1.9z',
  },
  sparkles: {
    label: 'Destellos',
    d: 'M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8',
  },
  camera: {
    label: 'Cámara',
    d: 'M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z',
  },
  users: {
    label: 'Personas',
    d: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  },
  shield: {
    label: 'Escudo',
    d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  },
  check: {
    label: 'Garantía',
    d: 'M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3',
  },
  bolt: {
    label: 'Rapidez',
    d: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  },
}

export const ICON_KEYS = Object.keys(ICON_DEFS) as IconKey[]

export function IconSvg({
  iconKey,
  size = 28,
  color = '#F07820',
}: {
  iconKey: string
  size?: number
  color?: string
}) {
  const def = ICON_DEFS[iconKey as IconKey] ?? ICON_DEFS.star
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={def.d} />
    </svg>
  )
}
