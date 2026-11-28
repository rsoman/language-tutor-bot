import { NavLink } from 'react-router'

import { ModeIconSvg } from './ModeIconSvg'
import styles from './ModeTabs.module.css'
import { modes } from './modes'

/**
 * The mode tabs. They are links, so each mode has its own address and the back button works.
 * NavLink adds aria-current="page" to the active one. CSS turns this into a bottom tab bar
 * on phones and a segmented control under the header on bigger screens (D0004).
 */
export function ModeTabs() {
  return (
    <nav aria-label="Practice mode" className={styles.nav}>
      <ul className={styles.list}>
        {modes.map((mode) => (
          <li key={mode.path} className={styles.item}>
            <NavLink to={mode.path} className={styles.tab}>
              <span className={styles.icon}>
                <ModeIconSvg icon={mode.icon} />
              </span>
              {mode.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
