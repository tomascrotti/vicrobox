import { describe, it, expect, vi, beforeEach } from 'vitest'

type QueryResult = { data: unknown; error: unknown }

function makeQuery(result: QueryResult) {
  const query: any = {
    select: vi.fn(() => query),
    then: (resolve: (r: QueryResult) => void) => Promise.resolve(result).then(resolve),
  }
  return query
}

let queryResult: QueryResult = { data: [], error: null }
const mockFrom = vi.fn(() => makeQuery(queryResult))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({ from: mockFrom })),
}))

import { getSettings } from '@/lib/data/settings'

describe('getSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('maps key/value rows into a SiteSettings object', async () => {
    queryResult = {
      data: [
        { key: 'whatsapp_number', value: '5491155556666' },
        { key: 'active_theme', value: 'navidad' },
      ],
      error: null,
    }
    const settings = await getSettings()
    expect(settings).toEqual({ whatsapp_number: '5491155556666', active_theme: 'navidad' })
  })

  it('falls back to defaults for missing keys', async () => {
    queryResult = { data: [], error: null }
    const settings = await getSettings()
    expect(settings).toEqual({ whatsapp_number: '', active_theme: 'default' })
  })

  it('falls back to defaults when the query errors', async () => {
    queryResult = { data: null, error: { message: 'boom' } }
    const settings = await getSettings()
    expect(settings).toEqual({ whatsapp_number: '', active_theme: 'default' })
  })
})
