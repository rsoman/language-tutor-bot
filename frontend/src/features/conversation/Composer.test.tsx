import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Composer } from './Composer'

describe('Composer', () => {
  test('Enter sends the message and clears the box', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<Composer onSend={onSend} disabled={false} />)
    await user.type(screen.getByRole('textbox', { name: 'Message' }), 'Hello{Enter}')
    expect(onSend).toHaveBeenCalledWith('Hello')
    expect(screen.getByRole('textbox', { name: 'Message' })).toHaveValue('')
  })

  test('Shift+Enter starts a new line instead of sending', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<Composer onSend={onSend} disabled={false} />)
    await user.type(
      screen.getByRole('textbox', { name: 'Message' }),
      'Hello{Shift>}{Enter}{/Shift}',
    )
    expect(onSend).not.toHaveBeenCalled()
  })

  test('the message is limited to 500 characters', () => {
    render(<Composer onSend={vi.fn()} disabled={false} />)
    expect(screen.getByRole('textbox', { name: 'Message' })).toHaveAttribute('maxlength', '500')
  })

  test('surrounding spaces are trimmed before sending', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<Composer onSend={onSend} disabled={false} />)
    await user.type(screen.getByRole('textbox', { name: 'Message' }), '  Hello  {Enter}')
    expect(onSend).toHaveBeenCalledWith('Hello')
  })

  test('nothing is sent while disabled', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<Composer onSend={onSend} disabled={true} />)
    await user.type(screen.getByRole('textbox', { name: 'Message' }), 'Hello{Enter}')
    expect(onSend).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled()
  })
})

describe('Composer word help', () => {
  test('an inserted word goes into an empty box without a leading space', async () => {
    const { appendWord } = await import('./Composer')
    expect(appendWord('', 'the-word')).toBe('the-word')
    expect(appendWord('I want', 'the-word')).toBe('I want the-word')
    expect(appendWord('I want ', 'the-word')).toBe('I want the-word')
  })
})
