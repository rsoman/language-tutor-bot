import { Outlet } from 'react-router'

import { ModeTabs } from '../features/modes/ModeTabs'
import styles from './AppLayout.module.css'
import { Header } from './Header'

/** The frame around every mode: header, mode tabs, and the current mode in <main>. */
export function AppLayout() {
  return (
    <div className={styles.shell}>
      <Header />
      <ModeTabs />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
