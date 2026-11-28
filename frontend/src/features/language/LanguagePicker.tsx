import { useEffect, useRef } from 'react'

import { useLanguageChoice } from './LanguageChoiceContext'
import styles from './LanguagePicker.module.css'

/**
 * The language and level pill in the header, and the popover it opens.
 * The popover has two radio groups (language, then that language's levels).
 * Picking a radio saves the choice straight away; "Done" or Escape closes it.
 */
export function LanguagePicker() {
  const {
    status,
    languages,
    choice,
    chooseLanguage,
    chooseLevel,
    pickerOpen,
    openPicker,
    closePicker,
  } = useLanguageChoice()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const wasOpen = useRef(false)

  // Move focus into the popover when it opens, and back to the pill when it closes,
  // so keyboard users never lose their place.
  useEffect(() => {
    if (pickerOpen) {
      const target =
        dialogRef.current?.querySelector<HTMLInputElement>('input:checked') ??
        dialogRef.current?.querySelector<HTMLInputElement>('input')
      target?.focus()
    } else if (wasOpen.current) {
      buttonRef.current?.focus()
    }
    wasOpen.current = pickerOpen
  }, [pickerOpen])

  // While the popover is open, Escape closes it, and Tab and Shift+Tab stay inside it.
  useEffect(() => {
    if (!pickerOpen) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closePicker()
      if (event.key === 'Tab' && dialogRef.current) keepFocusInside(dialogRef.current, event)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [pickerOpen, closePicker])

  return (
    <div className={styles.wrapper}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.pill}
        disabled={status !== 'ready'}
        aria-haspopup="dialog"
        aria-expanded={pickerOpen}
        onClick={pickerOpen ? closePicker : openPicker}
      >
        <PillLabel />
        <svg
          className={styles.chevron}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {pickerOpen && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-label="Choose language and level"
          className={styles.dialog}
        >
          <fieldset className={styles.group}>
            <legend className={styles.legend}>Language</legend>
            {languages.map((language) => (
              <div key={language.code} className={styles.option}>
                <label className={styles.optionLabel}>
                  <input
                    type="radio"
                    name="language"
                    value={language.code}
                    checked={choice?.language.code === language.code}
                    onChange={() => chooseLanguage(language.code)}
                    aria-describedby={`native-name-${language.code}`}
                  />
                  {language.name}
                </label>
                <span id={`native-name-${language.code}`} className={styles.hint}>
                  {language.native_name}
                </span>
              </div>
            ))}
          </fieldset>

          {choice && (
            <fieldset className={styles.group}>
              <legend className={styles.legend}>Level ({choice.language.level_system})</legend>
              <div className={styles.levels}>
                {choice.language.levels.map((level) => (
                  <label key={level.code} className={styles.levelLabel}>
                    <input
                      type="radio"
                      name="level"
                      value={level.code}
                      checked={choice.level === level.code}
                      onChange={() => chooseLevel(level.code)}
                    />
                    {level.code}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <button type="button" className={styles.done} onClick={closePicker}>
            Done
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Wraps Tab from the last control to the first, and Shift+Tab from the first to the last.
 * A radio group is one Tab stop, so only the checked radio (or the first, if none is
 * checked) of each group counts.
 */
function keepFocusInside(dialog: HTMLElement, event: KeyboardEvent) {
  const stops = tabStops(dialog)
  const first = stops[0]
  const last = stops[stops.length - 1]
  if (!first || !last) return
  const active = document.activeElement
  if (!event.shiftKey && (active === last || !dialog.contains(active))) {
    event.preventDefault()
    first.focus()
  } else if (event.shiftKey && (active === first || !dialog.contains(active))) {
    event.preventDefault()
    last.focus()
  }
}

function tabStops(dialog: HTMLElement): HTMLElement[] {
  const stops: HTMLElement[] = []
  const seenGroups = new Set<string>()
  for (const element of dialog.querySelectorAll<HTMLElement>('input, button')) {
    if (element instanceof HTMLInputElement && element.type === 'radio') {
      if (seenGroups.has(element.name)) continue
      const group = dialog.querySelectorAll<HTMLInputElement>(`input[name="${element.name}"]`)
      const checked = Array.from(group).find((radio) => radio.checked)
      seenGroups.add(element.name)
      stops.push(checked ?? element)
    } else {
      stops.push(element)
    }
  }
  return stops
}

/** What the pill says. On phones it shows the language code instead of the name (CSS). */
function PillLabel() {
  const { status, choice } = useLanguageChoice()

  if (status === 'loading') return <span>Loading languages</span>
  if (status === 'error') return <span>Languages unavailable</span>
  if (!choice) return <span>Choose language</span>

  return (
    <>
      <span className={styles.long}>
        {choice.language.name} · {choice.level}
      </span>
      <span className={styles.short}>
        {choice.language.code.toUpperCase()} · {choice.level}
      </span>
    </>
  )
}
