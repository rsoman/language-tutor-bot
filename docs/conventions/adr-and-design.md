# Decision records: ADRs and design decisions

There are two kinds of decision records. Both are short, numbered, and never deleted.

| Kind | Folder | Use for | Example |
|---|---|---|---|
| ADR (architecture decision record) | `docs/adr/` | Technical choices that are costly to reverse | Vite over Next.js, DynamoDB for state |
| DDR (design decision record) | `docs/design/` | Product and UX rules the UI must follow | How a grammar correction is shown |

## When to write one

- You chose between real alternatives and someone will ask "why" later.
- A spec or review comment settled a rule that code must follow.
- You are reversing an earlier decision. Write a new record that supersedes the old one.

Not needed for choices that are obvious or easy to undo.

## Process

1. Copy the template (`docs/adr/_template.md` or `docs/design/_template.md`) to the next free number.
2. Status starts as `proposed`. Open it in a PR; the owner moves it to `accepted` by approving the PR.
3. Once accepted, do not edit the decision. To change it, write a new record with
   `Supersedes: NNNN` and set the old one to `superseded by NNNN`.
4. Link the record from the spec or code it affects.

## Claude Code

- Before changing architecture or a UI rule, check `docs/adr/` and `docs/design/` for an accepted record.
- If a change contradicts an accepted record, stop and propose a new record instead.
