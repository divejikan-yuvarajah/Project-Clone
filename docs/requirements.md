# Requirements

## Functional

- **Chat:** streaming responses, markdown + code rendering, edit/regenerate/stop, conversation CRUD (create/rename/delete/search), export, model picker.
- **Coding assistant:** multi-language generation/explanation/debugging/refactoring/review/tests, file paste/upload. No auto-execution of generated code in V1.
- **Study mode (V2):** explanation-depth toggle (concise/detailed/exam), notes, flashcards, quizzes, PDF-grounded Q&A.
- **Document analysis (V2):** PDF/TXT/MD/DOCX/CSV/code/image upload, size limits, content extraction.
- **Images (V2):** vision (understanding) via Claude natively; generation via a separate, swappable provider.
- **Research (V2):** external search API + retrieval + citations; never fabricate a source.
- **Productivity (V2):** writing, planning, summarizing, reusable prompt library.
- **Artifacts (V3):** sandboxed preview for HTML/CSS/JS, React, Markdown, diagrams, tables.
- **Memory (V2):** opt-in, user-editable, deletable, separate from chat history, never auto-saves sensitive data.
- **Settings:** provider config, model picker, theme, usage/cost dashboard, data export/delete. No API keys ever rendered client-side.

## Non-functional

- Single-user by default; must not expose secrets even without a login wall.
- Must degrade gracefully on API errors, rate limits, and provider outages.
- Must stay inside a tight personal budget — every paid call traceable to a cost estimate.
- Low operational complexity — one person must be able to maintain it.

## Out of scope for V1

Everything tagged (V2) or (V3) above. Build strictly in the order set by `roadmap.md`.
