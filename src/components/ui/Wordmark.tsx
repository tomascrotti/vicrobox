const LETTERS = [
  { letter: 'V', color: '#F07820' },
  { letter: 'I', color: '#F5C420' },
  { letter: 'C', color: '#28C44A' },
  { letter: 'R', color: '#F07820' },
  { letter: 'O', color: '#1A52C8' },
  { letter: 'B', color: '#00B898' },
  { letter: 'O', color: '#079684' },
  { letter: 'X', color: '#F07820' },
] as const

type WordmarkProps = { className?: string }

export function Wordmark({ className }: WordmarkProps) {
  return (
    <span className={className} aria-label="Vicrobox">
      {LETTERS.map(({ letter, color }, i) => (
        <span key={i} style={{ color }}>{letter}</span>
      ))}
    </span>
  )
}
