import { render, screen } from '@testing-library/react'

import type { Feedback } from '../../api/client'
import { FeedbackCard } from './FeedbackCard'

const sentence = [
  { text: 'Start ', changed: false },
  { text: 'good part', changed: true },
  { text: ' end.', changed: false },
]

function feedback(kind: Feedback['kind'], overrides: Partial<Feedback> = {}): Feedback {
  return {
    kind,
    original: 'bad part',
    replacement: 'good part',
    explanation: 'Made-up explanation.',
    corrected_sentence: sentence,
    ...overrides,
  }
}

describe('FeedbackCard', () => {
  test.each([
    ['grammar_error', 'Almost there'],
    ['new_word', 'New word'],
    ['known_word', "You've seen this one"],
    ['unclear_word', 'Which word did you mean?'],
  ] as const)('a %s card is headed "%s"', (kind, heading) => {
    render(<FeedbackCard feedback={feedback(kind)} />)
    expect(screen.getByRole('article', { name: heading })).toBeInTheDocument()
  })

  test('mistakes use the mistake colour and help uses the help colour', () => {
    render(<FeedbackCard feedback={feedback('grammar_error')} />)
    render(<FeedbackCard feedback={feedback('new_word')} />)
    expect(screen.getByRole('article', { name: 'Almost there' })).toHaveAttribute(
      'data-tone',
      'mistake',
    )
    expect(screen.getByRole('article', { name: 'New word' })).toHaveAttribute('data-tone', 'help')
  })

  test('the corrected sentence comes last, with the changed part in bold', () => {
    render(<FeedbackCard feedback={feedback('grammar_error')} />)
    const card = screen.getByRole('article')
    const paragraphs = card.querySelectorAll('p')
    const last = paragraphs[paragraphs.length - 1]
    expect(last).toHaveTextContent('Start good part end.')
    expect(last?.querySelector('strong')).toHaveTextContent('good part')
  })

  test('a new word card says the word was added to drills', () => {
    render(<FeedbackCard feedback={feedback('new_word')} />)
    expect(screen.getByText('Added to your drills')).toBeInTheDocument()
  })

  test('a known word card says the word moved up in drills', () => {
    render(<FeedbackCard feedback={feedback('known_word')} />)
    expect(screen.getByText('Moved up in your drills')).toBeInTheDocument()
  })

  test('an unclear word card shows the question and no corrected sentence', () => {
    render(
      <FeedbackCard
        feedback={feedback('unclear_word', {
          original: null,
          replacement: null,
          explanation: 'What did you mean?',
          corrected_sentence: null,
        })}
      />,
    )
    const card = screen.getByRole('article')
    expect(card).toHaveTextContent('What did you mean?')
    expect(card.querySelector('strong')).toBeNull()
  })
})
