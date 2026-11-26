// A small typed wrapper around fetch() for the backend API.
// The types come from schema.d.ts, which is generated from the backend's OpenAPI schema
// (run `bash scripts/export-openapi.sh`). Never edit schema.d.ts by hand.
// Exception: the tutor's output types are hand-written in tutorTypes.ts until the owner's
// backend models exist.
import type { components } from './schema'
import type { Conversation, Turn } from './tutorTypes'

export type { Conversation, Feedback, Segment, TutorMessage, Turn } from './tutorTypes'

type Schemas = components['schemas']

export type Language = Schemas['LanguageOut']
export type Word = Schemas['WordOut']

/** An API error that keeps the HTTP status, so callers can tell "not found" from a failure. */
export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

// In development Vite forwards /api/* to the FastAPI app (see vite.config.ts).
function apiUrl(path: string): string {
  return new URL(`/api${path}`, window.location.origin).toString()
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(apiUrl(path))
  if (!response.ok) {
    throw new ApiError(`GET ${path} failed with status ${response.status}`, response.status)
  }
  return (await response.json()) as T
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(apiUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new ApiError(`POST ${path} failed with status ${response.status}`, response.status)
  }
  return (await response.json()) as T
}

export function fetchLanguages(): Promise<Language[]> {
  return getJson<Language[]>('/languages')
}

export function startConversation(language: string, level: string): Promise<Conversation> {
  return postJson<Conversation>('/conversations', { language, level })
}

export function sendTurn(conversationId: string, message: string): Promise<Turn> {
  return postJson<Turn>(`/conversations/${encodeURIComponent(conversationId)}/turns`, { message })
}

export function lookupWord(language: string, level: string, query: string): Promise<Word> {
  const params = new URLSearchParams({ language, level, query })
  return getJson<Word>(`/words/lookup?${params.toString()}`)
}
