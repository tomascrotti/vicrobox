import { describe, it, expect } from 'vitest'
import { slugify } from '@/lib/slugify'

describe('slugify', () => {
  it('lowercases and replaces spaces with dashes', () => {
    expect(slugify('Cabina Espejada')).toBe('cabina-espejada')
  })
  it('strips accents', () => {
    expect(slugify('Fotografía')).toBe('fotografia')
  })
  it('collapses multiple spaces', () => {
    expect(slugify('  Foto  Cabina  ')).toBe('foto-cabina')
  })
  it('removes special characters', () => {
    expect(slugify('Túnel & LED!')).toBe('tunel-led')
  })
})
