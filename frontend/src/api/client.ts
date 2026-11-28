// A small fetch wrapper for the backend API.
// The Zod schemas in generated/schemas.ts come from the backend's OpenAPI schema
// (`pnpm gen:api`, ADR 0004). Never edit them by hand. Responses with a generated schema are
// parsed with it, so a response with the wrong shape fails like any other failed request.
// Exception: the tutor's output and word lookup types are hand-written in tutorTypes.ts
// until the owner's backend models exist.
import type { z } from 'zod'

import {
  LanguagesLanguagesGetResponse,
  ListScenariosScenariosGetResponse,
} from './generated/schemas'
import type { Conversation, Turn, Word } from './tutorTypes'

export type { Conversation, Feedback, Segment, TutorMessage, Turn, Word } from './tutorTypes'

export type Language = z.infer<typeof LanguagesLanguagesGetResponse>[number]
export type Level = Language['levels'][number]
export type Scenario = z.infer<typeof ListScenariosScenariosGetResponse>[number]

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

async function getJson(path: string): Promise<unknown> {
  const response = await fetch(apiUrl(path))
  if (!response.ok) {
    throw new ApiError(`GET ${path} failed with status ${response.status}`, response.status)
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
    throw new ApiError(`POST ${path} failed with status ${response.status}`, response.status)
  }
  return (await response.json()) as T
}

export async function fetchLanguages(): Promise<Language[]> {
  return LanguagesLanguagesGetResponse.parse(await getJson('/languages'))
}

export function startConversation(
  language: string,
  level: string,
  scenarioId: string | null = null,
): Promise<Conversation> {
  return postJson<Conversation>('/conversations', { language, level, scenario_id: scenarioId })
}

export function sendTurn(conversationId: string, message: string): Promise<Turn> {
  return postJson<Turn>(`/conversations/${encodeURIComponent(conversationId)}/turns`, { message })
}

export async function lookupWord(language: string, level: string, query: string): Promise<Word> {
  const params = new URLSearchParams({ language, level, query })
  // Word is the owner's hand-written shape until his model lands (react.md exception).
  return (await getJson(`/words/lookup?${params.toString()}`)) as Word
}

export async function fetchScenarios(language: string, level: string): Promise<Scenario[]> {
  const params = new URLSearchParams({ language, level })
  return ListScenariosScenariosGetResponse.parse(await getJson(`/scenarios?${params.toString()}`))
}
