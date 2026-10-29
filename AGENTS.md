# Instructions for AI coding assistants (Codex, etc.)

This file tells any AI coding assistant working on this repo how to behave. Read it before making any change.

## Before you touch code

1. Read `docs/architecture.md` and `docs/roadmap.md` — understand which phase is active and what "done" looks like for it.
2. Check `docs/requirements.md` if the task touches a feature — confirm it's in scope for the current phase (MVP/V2/V3).
3. If a task is ambiguous, propose a short plan (files to touch, new dependencies) and wait for approval before writing code.

## While working

- Keep changes scoped to one task or one phase step at a time. Do not implement features from a later phase "while you're in there."
- Inspect existing code before changing it. Do not rewrite working code unless the task requires it.
- Never touch `.env`, `.env.local`, or any file containing real secrets. Only `.env.example` (placeholders only) should ever be edited or committed.
- The Anthropic API key is read **only** in server-side code (`lib/anthropic/client.ts` and Route Handlers under `app/api/`). It must never appear in a client component, a `NEXT_PUBLIC_*` variable, or any code that ships to the browser.
- Follow the folder structure in `docs/architecture.md`. New files go where that structure says they go.
- **Placeholder/stub files must still be valid modules.** A `page.tsx` for a not-yet-built route needs a real default export (e.g. a simple "coming in Phase N" component); an `app/api/**/route.ts` stub needs at least one real HTTP method export (e.g. a handler returning `501` with a short message). A literally empty (zero-byte) file breaks the Next.js build — don't create one even when told to leave a stub "empty."
- Use TypeScript strict mode — avoid `any` unless there's no reasonable alternative, and explain why in a comment if you do.
- Styling is Tailwind CSS utility classes — avoid introducing a second styling system.
- Ask before adding a new dependency. Prefer the libraries already named in `docs/architecture.md` over introducing new ones for the same job.

## After a change

- Run lint and, once tests exist, run the test suite. Report the results.
- Update the relevant `docs/*.md` file if the change affects architecture, schema, or security posture — docs and code should never drift apart.
- Use small, meaningful commits — one logical change per commit.

## Definition of done (per phase)

Check `docs/roadmap.md` for the specific "Definition of done" for the phase you're working in. Don't mark a phase complete until its DoD is actually met.
