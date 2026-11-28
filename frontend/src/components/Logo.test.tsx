import { render } from '@testing-library/react'

import { Logo } from './Logo'

describe('Logo', () => {
  test('is decorative, so screen readers skip it', () => {
    const { container } = render(<Logo size={32} />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  test('takes its colours from tokens, not hex values', () => {
    const { container } = render(<Logo size={32} />)
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  })
})
