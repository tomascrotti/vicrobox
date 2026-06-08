const SEGMENTS = [
  { text: 'VI', color: '#F8BD19' },
  { text: 'CRO', color: '#079684' },
  { text: 'BOX', color: '#EA7C03' },
] as const

type WordmarkProps = { className?: string }

/**
 * Single source of truth for the "VICROBOX" logo coloring — validated
 * live with the client. Don't reintroduce per-usage color arrays.
 */
export function Wordmark({ className }: WordmarkProps) {
  return (
    <span className={className} aria-label="Vicrobox">
      {SEGMENTS.map(({ text, color }) => (
        <span key={text} style={{ color }}>{text}</span>
      ))}
    </span>
  )
}
