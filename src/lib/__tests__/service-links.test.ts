import { describe, it, expect } from 'vitest'
import { buildServiceHref } from '@/lib/service-links'

describe('buildServiceHref', () => {
  it('points every service at the quote anchor (no detail pages yet)', () => {
    expect(buildServiceHref('fotocabina')).toBe('#cta')
    expect(buildServiceHref('cabina-espejada')).toBe('#cta')
  })
})
