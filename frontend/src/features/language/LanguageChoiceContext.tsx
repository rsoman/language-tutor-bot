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

  // A saved choice only counts if the backend still offers that language and level.
  const language = languages.find((l) => l.code === saved?.code)
  const choice =
    language && saved && language.levels.some((level) => level.code === saved.level)
      ? { language, level: saved.level }
      : null

  function update(next: LanguageChoice) {
    setSaved(next)
    saveChoice(next)
  }

  const value: LanguageChoiceValue = {
    status,
    languages,
    choice,
    chooseLanguage(code) {
      // Levels are sorted by rank (useLanguages), so the first one is the easiest.
      const picked = languages.find((l) => l.code === code)
      const easiest = picked?.levels[0]
      if (picked && easiest) update({ code: picked.code, level: easiest.code })
    },
    chooseLevel(level) {
      if (choice) update({ code: choice.language.code, level })
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
