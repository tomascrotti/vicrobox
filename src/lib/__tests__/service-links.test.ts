import { describe, it, expect } from 'vitest'
import { buildServiceHref } from '@/lib/service-links'

describe('buildServiceHref', () => {
  it('returns the service detail page URL', () => {
    expect(buildServiceHref('fotocabina')).toBe('/servicios/fotocabina')
    expect(buildServiceHref('cabina-espejada')).toBe('/servicios/cabina-espejada')
  })
})
