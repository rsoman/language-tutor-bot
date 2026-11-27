// Hand-written types for the tutor's output (spec 003) and word lookups (spec 004), the one
// exception to "API types are generated". The owner writes these backend models himself, together
// with the logic behind them, so they are not in the OpenAPI schema yet. This file mirrors the
// contracts in specs/003-conversation-chat.md and specs/004-word-help.md. When the owner's models land, delete this file and take the
// types from schema.d.ts like the others (`pnpm gen:api` will show any drift as type errors).

/** Something the tutor says, in the target language, with an optional translation. */
export type TutorMessage = {
  text: string
  translation: string | null
}

/** A piece of the corrected sentence. Changed pieces are shown in bold (D0001). */
export type Segment = {
  text: string
  changed: boolean
}

export type FeedbackKind = 'grammar_error' | 'new_word' | 'known_word' | 'unclear_word'

/** One feedback card on a learner message (D0001, D0002). Which fields are set depends on kind. */
export type Feedback = {
  kind: FeedbackKind
  original: string | null
  replacement: string | null
  explanation: string | null
  corrected_sentence: Segment[] | null
}

/** POST /conversations answers with this. */
export type Conversation = {
  id: string
  opening: TutorMessage
}

/** POST /conversations/{id}/turns answers with this. */
export type Turn = {
  feedback: Feedback[]
  reply: TutorMessage
}

/** One grammatical feature the language's profile declares, e.g. a plural (D0003). */
export type WordFeature = {
  name: string
  value: string
}

/** An example sentence in the target language, with its translation. */
export type WordExample = {
  text: string
  translation: string | null
}

/** GET /words/lookup answers with this: the best match, in the target language. */
export type Word = {
  headword: string
  part_of_speech: string
  features: WordFeature[]
  example: WordExample | null
}
