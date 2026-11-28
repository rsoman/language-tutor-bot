import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

import type { Language } from '../../api/client'
import { loadChoice, saveChoice, type LanguageChoice } from './languageStorage'
import { useLanguages } from './useLanguages'

type LanguageStatus = 'loading' | 'error' | 'ready'

type LanguageChoiceValue = {
  status: LanguageStatus
  languages: Language[]
  /** The chosen language and level, or null when the learner has not chosen yet. */
  choice: { language: Language; level: string } | null
  chooseLanguage: (code: string) => void
  chooseLevel: (level: string) => void
  retry: () => void
  pickerOpen: boolean
  openPicker: () => void
  closePicker: () => void
}

const LanguageChoiceContext = createContext<LanguageChoiceValue | null>(null)

/**
 * The saved level if the language still offers it, otherwise its easiest level.
 * Levels are sorted by rank (useLanguages), so the first one is the easiest.
 */
function currentLevel(language: Language, savedLevel: string | undefined): string | undefined {
  const offered = language.levels.some((level) => level.code === savedLevel)
  return offered ? savedLevel : language.levels[0]?.code
}

/**
 * Holds the learner's language and level choice for the whole app.
 * There is no default language: until the learner picks one, `choice` is null.
 */
export function LanguageChoiceProvider({ children }: { children: ReactNode }) {
  const query = useLanguages()
  const [saved, setSaved] = useState<LanguageChoice | null>(loadChoice)
  const [pickerOpen, setPickerOpen] = useState(false)
  // Stable functions, so effects that depend on them do not re-run on every render.
  const openPicker = useCallback(() => setPickerOpen(true), [])
  const closePicker = useCallback(() => setPickerOpen(false), [])

  const languages = query.data ?? []
  const status: LanguageStatus = query.isPending ? 'loading' : query.isError ? 'error' : 'ready'

  // A saved choice only counts if the backend still offers that language. A saved level it no
  // longer offers falls back to the easiest one (spec 002).
  const language = languages.find((l) => l.code === saved?.code)
  const level = language && saved ? currentLevel(language, saved.level) : undefined
  const choice = language && level ? { language, level } : null

  function update(code: string, level: string) {
    const next = { code, level, levels: { ...saved?.levels, [code]: level } }
    setSaved(next)
    saveChoice(next)
  }

  const value: LanguageChoiceValue = {
    status,
    languages,
    choice,
    chooseLanguage(code) {
      // Spec 002: picking a language selects its current level, the one last chosen for it.
      const picked = languages.find((l) => l.code === code)
      const level = picked ? currentLevel(picked, saved?.levels[code]) : undefined
      if (picked && level) update(picked.code, level)
    },
    chooseLevel(level) {
      if (choice) update(choice.language.code, level)
    },
    retry() {
      void query.refetch()
    },
    pickerOpen,
    openPicker,
    closePicker,
  }

  return <LanguageChoiceContext value={value}>{children}</LanguageChoiceContext>
}

export function useLanguageChoice(): LanguageChoiceValue {
  const value = useContext(LanguageChoiceContext)
  if (!value) throw new Error('useLanguageChoice must be used inside LanguageChoiceProvider')
  return value
}
