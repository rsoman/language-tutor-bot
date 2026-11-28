// Keeps the learner's language and level choice in the browser (localStorage) until
// accounts exist. Then the choice moves to the user profile and this file goes away.

export type LanguageChoice = {
  code: string
  level: string
  /** Each chosen language's current level, by language code (spec 002, owner 2026-11-28). */
  levels: Record<string, string>
}

export const STORAGE_KEY = 'vaikhari.languageChoice'

type SavedChoice = { code: string; level: string; levels?: unknown }

function isSavedChoice(value: unknown): value is SavedChoice {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).code === 'string' &&
    typeof (value as Record<string, unknown>).level === 'string'
  )
}

function isLevelMap(value: unknown): value is Record<string, string> {
  if (typeof value !== 'object' || value === null) return false
  return Object.values(value).every((level) => typeof level === 'string')
}

/**
 * The saved choice, or null if there is none or it cannot be read.
 * A choice saved before per-language levels existed has no `levels`; its own level then
 * counts as that language's current level, so the learner loses nothing.
 */
export function loadChoice(): LanguageChoice | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return null
    const parsed: unknown = JSON.parse(raw)
    if (!isSavedChoice(parsed)) return null
    const levels = isLevelMap(parsed.levels) ? parsed.levels : {}
    return {
      code: parsed.code,
      level: parsed.level,
      levels: { ...levels, [parsed.code]: parsed.level },
    }
  } catch {
    // Bad JSON, or storage is blocked (private browsing): behave as if nothing was saved.
    return null
  }
}

export function saveChoice(choice: LanguageChoice): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(choice))
  } catch {
    // Storage is blocked. The choice still works until the page is reloaded.
  }
}
