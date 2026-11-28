# Code style: rules for both languages

Applies to all Python and TypeScript, hand-written or generated. Language-specific rules are in
`python.md` and `react.md`. **B** = blocking (fails review), **N** = non-blocking (comment only).

## Base standards

We adopt established standards and write down only what we add:

- Python: PEP 8, enforced by ruff. Types checked by pyright (strict for `src/`).
- TypeScript: typescript-eslint strict plus Prettier.

If the linter or formatter accepts it, do not argue about it in review.

## Our rules

- **B** Comments explain why, not what. When a rule comes from a spec or decision record, cite it
  (`# D0001`, `// ADR 0003`).
- **B** No clever one-liners. One condition per comprehension, no nested comprehensions, no nested
  ternaries. This repo is for learning, so readable beats short.
- **B** Names are full words. Allowed abbreviations: `id`, `url`, `api`, `llm`, `db`, `ui`.
- **N** Size: functions up to about 40 lines, files up to about 300, React components up to
  about 150. Longer code needs either a reason in the PR or a linked follow-up issue to refactor it.
- **B** No dead code, commented-out code or `TODO` without a linked issue.

## The new-technology gate (B)

The stack is Python and TypeScript. Adding any new language, framework, database tool, IaC tool
or test runner needs, in the same PR or before it:

1. An ADR in `docs/adr/` saying why.
2. Its own style section in `docs/conventions/` (or a new file listed in the root `CLAUDE.md`).

Claude reminds the owner of this whenever new tech is proposed. The reviewer flags any new tool
without both. A new library inside the existing stack needs only a one-line reason in the PR
(see `security.md`, dependencies).
