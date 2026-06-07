import { describe, it, expect } from 'vitest'
import { getServiceIcon, SERVICE_ICON_NAMES } from '@/lib/icons'

describe('getServiceIcon', () => {
  it('returns a component for every known icon name', () => {
    for (const name of SERVICE_ICON_NAMES) {
      expect(getServiceIcon(name)).toBeTypeOf('function')
    }
  })

  it('returns the fallback component for an unknown name', () => {
    expect(getServiceIcon('unknown-icon-xyz')).toBe(getServiceIcon('default'))
  })

  it('returns the fallback component for an empty string', () => {
    expect(getServiceIcon('')).toBe(getServiceIcon('default'))
  })
})
