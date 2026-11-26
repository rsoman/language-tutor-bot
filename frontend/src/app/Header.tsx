import { Logo } from '../components/Logo'
import { appName } from '../config'
import { LanguagePicker } from '../features/language/LanguagePicker'
import styles from './Header.module.css'

export function Header() {
  return (
    <header className={styles.header}>
      <span className={styles.brand}>
        <Logo size={32} />
        <span className={styles.name}>{appName}</span>
      </span>
      <LanguagePicker />
    </header>
  )
}
