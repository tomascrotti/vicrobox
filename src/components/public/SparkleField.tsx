'use client'

import { useEffect, useState } from 'react'

type Sparkle = { left: string; top: string; color: string; size: string; delay: string; duration: string }
type AmbientFlash = { left: string; top: string; size: string; delay: string; duration: string }

const SPARKLE_COLORS = ['#00B898', '#F5C420', '#F07820', '#28C44A', '#1A52C8', '#EA7C03', '#F8BD19', '#079684']

function randomSparkles(count: number): Sparkle[] {
  return Array.from({ length: count }, () => ({
    left: `${Math.round(Math.random() * 96)}%`,
    top: `${Math.round(Math.random() * 92)}%`,
    color: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
    size: `${10 + Math.round(Math.random() * 8)}px`,
    delay: `${(Math.random() * 4).toFixed(1)}s`,
    duration: '3.2s',
  }))
}

function randomAmbientFlashes(count: number): AmbientFlash[] {
  return Array.from({ length: count }, () => ({
    left: `${Math.round(Math.random() * 90)}%`,
    top: `${Math.round(Math.random() * 90)}%`,
    size: `${280 + Math.round(Math.random() * 220)}px`,
    delay: `${(Math.random() * 5).toFixed(1)}s`,
    duration: `${(3.6 + Math.random() * 2).toFixed(1)}s`,
  }))
}

export function SparkleField({ count = 24, className = 'absolute inset-0' }: { count?: number; className?: string }) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([])
  const [ambientFlashes, setAmbientFlashes] = useState<AmbientFlash[]>([])

  useEffect(() => {
    setSparkles(randomSparkles(count))
    setAmbientFlashes(randomAmbientFlashes(Math.max(2, Math.round(count / 5))))
  }, [count])

  return (
    <div className={`${className} pointer-events-none`} aria-hidden="true">
      {ambientFlashes.map((f, i) => (
        <span
          key={`a${i}`}
          className="absolute rounded-full"
          style={{
            left: f.left,
            top: f.top,
            width: f.size,
            height: f.size,
            background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)',
            animation: `shutterflash-bg ${f.duration} ease-in-out infinite`,
            animationDelay: f.delay,
            animationFillMode: 'backwards',
          }}
        />
      ))}
      {sparkles.map((s, i) => (
        <span
          key={i}
          className="absolute"
          style={{
            left: s.left,
            top: s.top,
            color: s.color,
            fontSize: s.size,
            animation: `shutterflash-bg ${s.duration} ease-in-out infinite`,
            animationDelay: s.delay,
            animationFillMode: 'backwards',
            filter: `drop-shadow(0 0 10px ${s.color})`,
          }}
        >
          ✦
        </span>
      ))}
    </div>
  )
}
