import { useEffect } from 'react'
import { Link } from 'react-router'

import { appName } from '../../config'
import { grammarPath } from './grammarPaths'
import styles from './NotBuiltYet.module.css'

type NotBuiltYetProps = {
  /** "Lesson", "Test" or "Combination test". */
  title: string
}

/** Stands in for a Grammar screen a later spec builds (007 lessons, 008 tests). */
export function NotBuiltYet({ title }: NotBuiltYetProps) {
  useEffect(() => {
    document.title = `${title} · ${appName}`
  }, [title])

  return (
    <section className={styles.panel} aria-labelledby="not-built-heading">
      <Link to={grammarPath} className={styles.back}>
        <span aria-hidden="true" className={styles.arrow}>
          ←
        </span>
        Grammar
      </Link>
      <h1 id="not-built-heading" className={styles.heading}>
        {title}
      </h1>
      <p className={styles.text}>This part is not built yet.</p>
    </section>
  )
}
