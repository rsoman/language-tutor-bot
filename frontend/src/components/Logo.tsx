import styles from './Logo.module.css'

type LogoProps = {
  size: number
}

/**
 * The Vaikhari mark (Icons board, option 1): two speech bubbles, "V" in front and "व" behind.
 * Colours come from tokens through CSS classes. It sits next to the app name, so it is
 * decorative (aria-hidden).
 */
export function Logo({ size }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className={styles.logo}>
      <rect className={styles.back} x="13" y="2" width="17" height="15" rx="4" />
      <path className={styles.back} d="M25 16.5l4 4.5v-4.5z" />
      <rect className={styles.front} x="2" y="11" width="17" height="15" rx="4" />
      <path className={styles.front} d="M6 25.5l-1.5 4.5 6-4.5z" />
      <text className={styles.frontLetter} x="10.5" y="22.6" textAnchor="middle">
        V
      </text>
      <text className={styles.backLetter} x="24.5" y="12.6" textAnchor="middle">
        व
      </text>
    </svg>
  )
}
