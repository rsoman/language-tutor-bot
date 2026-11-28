// Keeps keyboard focus inside an open popover (spec 002: Tab and Shift+Tab stay in the picker).

/**
 * Wraps Tab from the last control to the first, and Shift+Tab from the first to the last.
 * A radio group is one Tab stop, so only the checked radio (or the first, if none is
 * checked) of each group counts.
 */
export function keepFocusInside(dialog: HTMLElement, event: KeyboardEvent) {
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
