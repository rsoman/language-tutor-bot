// Keeps the learner's language and level choice in the browser (localStorage) until
// accounts exist. Then the choice moves to the user profile and this file goes away.

export type LanguageChoice = {
  code: string
  level: string
}

export const STORAGE_KEY = 'vaikhari.languageChoice'

function isLanguageChoice(value: unknown): value is LanguageChoice {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).code === 'string' &&
    typeof (value as Record<string, unknown>).level === 'string'
  )
}

/** The saved choice, or null if there is none or it cannot be read. */
export function loadChoice(): LanguageChoice | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return null
    const parsed: unknown = JSON.parse(raw)
    return isLanguageChoice(parsed) ? parsed : null
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
