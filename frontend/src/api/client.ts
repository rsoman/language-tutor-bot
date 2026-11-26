// A small typed wrapper around fetch() for the backend API.
// The types come from schema.d.ts, which is generated from the backend's OpenAPI schema
// (run `bash scripts/export-openapi.sh`). Never edit schema.d.ts by hand.
import type { components } from './schema'

type Schemas = components['schemas']

export type Language = Schemas['LanguageOut']
export type Conversation = Schemas['ConversationOut']
export type TutorMessage = Schemas['TutorMessageOut']
export type Feedback = Schemas['FeedbackOut']
export type Segment = Schemas['SegmentOut']
export type Turn = Schemas['TurnOut']

// In development Vite forwards /api/* to the FastAPI app (see vite.config.ts).
function apiUrl(path: string): string {
  return new URL(`/api${path}`, window.location.origin).toString()
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(apiUrl(path))
  if (!response.ok) {
    throw new Error(`GET ${path} failed with status ${response.status}`)
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
    throw new Error(`POST ${path} failed with status ${response.status}`)
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
