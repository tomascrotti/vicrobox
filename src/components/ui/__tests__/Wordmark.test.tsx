// @vitest-environment jsdom
// src/components/ui/__tests__/Wordmark.test.tsx
import { afterEach, describe, it, expect } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { Wordmark } from '@/components/ui/Wordmark'

afterEach(() => {
  cleanup()
})

describe('Wordmark', () => {
  it('renders the full "VICROBOX" mark', () => {
    render(<Wordmark />)
    expect(screen.getByLabelText('Vicrobox')).toHaveTextContent('VICROBOX')
  })

  it('colors the three brand segments per the validated mockup palette', () => {
    render(<Wordmark />)
    const spans = screen.getByLabelText('Vicrobox').querySelectorAll('span')
    expect(spans[0]).toHaveStyle({ color: '#F8BD19' }) // "VI"
    expect(spans[1]).toHaveStyle({ color: '#079684' }) // "CRO"
    expect(spans[2]).toHaveStyle({ color: '#EA7C03' }) // "BOX"
  })
})
