// The three practice modes. The order here is the order of the tabs.
// Copy is about the app, never about a target language.

export type ModeIcon = 'conversation' | 'grammar' | 'vocabulary'

export type Mode = {
  path: string
  label: string
  icon: ModeIcon
  /** Shown in the placeholder panel until the mode is built. */
  comingSoon: string
}

export const modes = [
  {
    path: '/conversation',
    label: 'Conversation',
    icon: 'conversation',
    comingSoon: 'Conversation practice arrives in the next step.',
  },
  {
    path: '/grammar',
    label: 'Grammar',
    icon: 'grammar',
    comingSoon: 'Grammar topics arrive in a later step.',
  },
  {
    path: '/vocabulary',
    label: 'Vocabulary',
    icon: 'vocabulary',
    comingSoon: 'Vocabulary drills arrive in a later step.',
  },
] as const satisfies readonly Mode[]
