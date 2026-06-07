import { describe, it, expect, vi, beforeEach } from 'vitest'

type QueryResult = { data: unknown; error: unknown }

function makeQuery(result: QueryResult) {
  const query: any = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    order: vi.fn(() => query),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
    then: (resolve: (r: QueryResult) => void) => Promise.resolve(result).then(resolve),
  }
  return query
}

let queryResult: QueryResult = { data: [], error: null }
const mockFrom = vi.fn(() => makeQuery(queryResult))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({ from: mockFrom })),
}))

import { getActiveServices, getServiceBySlug } from '@/lib/data/services'

describe('getActiveServices', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('queries the services table for active rows ordered by "order"', async () => {
    queryResult = {
      data: [{ id: '1', name: 'Fotocabina', slug: 'fotocabina', order: 0 }],
      error: null,
    }
    const services = await getActiveServices()

    expect(mockFrom).toHaveBeenCalledWith('services')
    expect(services).toHaveLength(1)
    expect(services[0].name).toBe('Fotocabina')
  })

  it('returns an empty array when the query errors', async () => {
    queryResult = { data: null, error: { message: 'boom' } }
    const services = await getActiveServices()
    expect(services).toEqual([])
  })
})

describe('getServiceBySlug', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the service when found', async () => {
    queryResult = {
      data: { id: '1', name: 'Fotocabina', slug: 'fotocabina', images: [] },
      error: null,
    }
    const service = await getServiceBySlug('fotocabina')
    expect(service?.slug).toBe('fotocabina')
  })

  it('returns null when not found', async () => {
    queryResult = { data: null, error: null }
    const service = await getServiceBySlug('no-existe')
    expect(service).toBeNull()
  })
})
