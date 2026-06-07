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

import { getActiveEvents, getEventBySlug } from '@/lib/data/events'

describe('getActiveEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('queries the events table for active rows with services and images', async () => {
    queryResult = {
      data: [{ id: '1', name: 'Boda Ana & Tom', slug: 'boda-ana-tom', event_type: 'casamiento' }],
      error: null,
    }
    const events = await getActiveEvents()

    expect(mockFrom).toHaveBeenCalledWith('events')
    expect(events).toHaveLength(1)
    expect(events[0].slug).toBe('boda-ana-tom')
  })

  it('returns an empty array when the query errors', async () => {
    queryResult = { data: null, error: { message: 'boom' } }
    const events = await getActiveEvents()
    expect(events).toEqual([])
  })
})

describe('getEventBySlug', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the event when found', async () => {
    queryResult = {
      data: { id: '1', name: 'Boda Ana & Tom', slug: 'boda-ana-tom', images: [], services: [] },
      error: null,
    }
    const event = await getEventBySlug('boda-ana-tom')
    expect(event?.slug).toBe('boda-ana-tom')
  })

  it('returns null when not found', async () => {
    queryResult = { data: null, error: null }
    const event = await getEventBySlug('no-existe')
    expect(event).toBeNull()
  })
})
