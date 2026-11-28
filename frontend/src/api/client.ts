// A small fetch wrapper for the backend API.
// The Zod schemas in generated/schemas.ts come from the backend's OpenAPI schema
// (`pnpm gen:api`, ADR 0004). Never edit them by hand. Responses with a generated schema are
// parsed with it, so a response with the wrong shape fails like any other failed request.
// Exception: the tutor's output types are hand-written in tutorTypes.ts until the owner's
// backend models exist.
import type { z } from 'zod'

import { LanguagesLanguagesGetResponse } from './generated/schemas'
import type { Conversation, Turn } from './tutorTypes'

export type { Conversation, Feedback, Segment, TutorMessage, Turn } from './tutorTypes'

export type Language = z.infer<typeof LanguagesLanguagesGetResponse>[number]
export type Level = Language['levels'][number]

// In development Vite forwards /api/* to the FastAPI app (see vite.config.ts).
function apiUrl(path: string): string {
  return new URL(`/api${path}`, window.location.origin).toString()
}

async function getJson(path: string): Promise<unknown> {
  const response = await fetch(apiUrl(path))
  if (!response.ok) {
    throw new Error(`GET ${path} failed with status ${response.status}`)
  }
  return response.json()
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

export async function fetchLanguages(): Promise<Language[]> {
  return LanguagesLanguagesGetResponse.parse(await getJson('/languages'))
}

export function startConversation(language: string, level: string): Promise<Conversation> {
  return postJson<Conversation>('/conversations', { language, level })
}

export function sendTurn(conversationId: string, message: string): Promise<Turn> {
  return postJson<Turn>(`/conversations/${encodeURIComponent(conversationId)}/turns`, { message })
}
