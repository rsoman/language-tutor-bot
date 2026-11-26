// A small typed wrapper around fetch() for the backend API.
// The types come from schema.d.ts, which is generated from the backend's OpenAPI schema
// (run `bash scripts/export-openapi.sh`). Never edit schema.d.ts by hand.
import type { components } from './schema'

export type Language = components['schemas']['LanguageOut']

// In development Vite forwards /api/* to the FastAPI app (see vite.config.ts).
function apiUrl(path: string): string {
  return new URL(`/api${path}`, window.location.origin).toString()
}

export async function fetchLanguages(): Promise<Language[]> {
  const response = await fetch(apiUrl('/languages'))
  if (!response.ok) {
    throw new Error(`GET /languages failed with status ${response.status}`)
  }
  return (await response.json()) as Language[]
}
