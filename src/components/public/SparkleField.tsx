'use client'

import { useEffect, useState } from 'react'

type Sparkle = { left: string; top: string; color: string; size: string; delay: string; duration: string }

const SPARKLE_COLORS = ['#00B898', '#F5C420', '#F07820', '#28C44A', '#1A52C8', '#EA7C03', '#F8BD19', '#079684']

function randomSparkles(count: number): Sparkle[] {
  return Array.from({ length: count }, () => ({
    left: `${Math.round(Math.random() * 96)}%`,
    top: `${Math.round(Math.random() * 92)}%`,
    color: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
    size: `${10 + Math.round(Math.random() * 8)}px`,
    delay: `${(Math.random() * 4).toFixed(1)}s`,
    duration: '7s',
  }))
}

export function SparkleField({ count = 24, className = 'absolute inset-0' }: { count?: number; className?: string }) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([])

  useEffect(() => {
    setSparkles(randomSparkles(count))
  }, [count])

  return (
    <div className={`${className} pointer-events-none`} aria-hidden="true">
      {sparkles.map((s, i) => (
        <span
          key={i}
          className="absolute"
          style={{
            left: s.left,
            top: s.top,
            color: s.color,
            fontSize: s.size,
            animation: `floatsp ${s.duration} ease-in-out infinite`,
            animationDelay: s.delay,
            animationFillMode: 'backwards',
            filter: `drop-shadow(0 0 6px ${s.color}99)`,
          }}
        >
          ✦
        </span>
      ))}
    </div>
  )
}
