# Security & Privacy Checklist

- [ ] API key only in server-side env vars (`.env.local`, never committed; `.env.example` has placeholders only).
- [ ] All provider calls happen in Route Handlers — the browser never sees a key.
- [ ] If deployed beyond localhost: Supabase Auth (even a single-user magic-link login) is added before anything else goes live. "No auth" is fine only while the app is unreachable from the internet.
- [ ] Input validation on every route (message length caps, file type/size checks).
- [ ] Rate limiting on `/api/chat` to cap accidental runaway spend.
- [ ] Rendered Markdown/HTML is sanitized — never `dangerouslySetInnerHTML` on raw model output.
- [ ] Artifact previews are sandboxed — iframe with a restrictive `sandbox` attribute, no same-origin access to the app's cookies/storage.
- [ ] Retrieved web content and uploaded document text are treated as **data**, not instructions — never let fetched content change the system prompt.
- [ ] Errors are logged without logging secrets or full user message content in production.
- [ ] Deleting a conversation cascades to its messages/attachments (`on delete cascade` in the schema); a "delete all my data" action exists in Settings.
- [ ] A hard spend cap is set in Anthropic Console → Billing, independent of app code.
- [ ] No API key appears in any client-side JavaScript bundle (verify in browser dev tools → Network/Sources before every deploy).
- [ ] `.env.local` is in `.gitignore` and was never committed.

Review this file before marking Phase 7 (Security & Optimization) or any public deployment as done.
