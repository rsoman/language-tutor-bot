import type { ModeIcon } from './modes'

type ModeIconSvgProps = {
  icon: ModeIcon
}

/** Stroke icons from the Mobile layouts board. They use currentColor, so they follow the text. */
export function ModeIconSvg({ icon }: ModeIconSvgProps) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icon === 'conversation' && <path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z" />}
      {icon === 'grammar' && (
        <>
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20V3H6.5A2.5 2.5 0 004 5.5z" />
          <path d="M4 19.5A2.5 2.5 0 006.5 22H20v-5" />
        </>
      )}
      {icon === 'vocabulary' && (
        <>
          <rect x="3" y="6" width="14" height="14" rx="2" />
          <path d="M7 3h12a2 2 0 012 2v12" />
        </>
      )}
    </svg>
  )
}
