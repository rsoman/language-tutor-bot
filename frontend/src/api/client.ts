// A small fetch wrapper for the backend API.
// The Zod schemas in generated/schemas.ts come from the backend's OpenAPI schema
// (`pnpm gen:api`, ADR 0004). Never edit them by hand. Every response is parsed with its
// schema, so a response with the wrong shape fails like any other failed request.
import type { z } from 'zod'

import { LanguagesLanguagesGetResponse } from './generated/schemas'

export type Language = z.infer<typeof LanguagesLanguagesGetResponse>[number]
export type Level = Language['levels'][number]

// In development Vite forwards /api/* to the FastAPI app (see vite.config.ts).
function apiUrl(path: string): string {
  return new URL(`/api${path}`, window.location.origin).toString()
}

export async function fetchLanguages(): Promise<Language[]> {
  const response = await fetch(apiUrl('/languages'))
  if (!response.ok) {
    throw new Error(`GET /languages failed with status ${response.status}`)
  }
  return LanguagesLanguagesGetResponse.parse(await response.json())
}
