// orval turns the backend's OpenAPI schema (openapi.json) into Zod schemas (ADR 0004).
// Only the Zod output is used: types come from the schemas with z.infer, and
// src/api/client.ts is our own small fetch wrapper. Run with `pnpm gen:api`.
import { defineConfig } from 'orval'

export default defineConfig({
  api: {
    input: './openapi.json',
    output: {
      client: 'zod',
      target: './src/api/generated/schemas.ts',
      mode: 'single',
    },
  },
})
