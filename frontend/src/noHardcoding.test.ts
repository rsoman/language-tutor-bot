// Guards for two repo rules that are easy to break by accident:
// 1. Hex colours live only in src/styles/tokens.css (frontend/CLAUDE.md).
// 2. No real target language or level system in frontend code or tests (root CLAUDE.md).
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = join(__dirname, '..')

function filesUnder(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? filesUnder(path) : [path]
  })
}

const sourceFiles = [...filesUnder(join(root, 'src')), ...filesUnder(join(root, 'e2e'))]
  .filter((f) => /\.(ts|tsx|css)$/.test(f))
  .filter((f) => !f.endsWith('noHardcoding.test.ts'))

test('no hex colour outside tokens.css', () => {
  const offenders = sourceFiles
    .filter((f) => !f.endsWith(join('styles', 'tokens.css')))
    .filter((f) => /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?\b/.test(readFileSync(f, 'utf8')))
    .map((f) => relative(root, f))
  expect(offenders).toEqual([])
})

test('no real language or level system hard-coded', () => {
  const banned = /\b(German|Deutsch|CEFR|JLPT|HSK)\b/
  const offenders = sourceFiles
    .filter((f) => banned.test(readFileSync(f, 'utf8')))
    .map((f) => relative(root, f))
  expect(offenders).toEqual([])
})
