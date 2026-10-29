# Roadmap

| Phase | Objective | Status |
|---|---|---|
| 0 — Feasibility | Confirm billing, finalize stack | ✅ Done — $50 Console promotional credit confirmed (applies to all models/products), stack = Next.js + Supabase |
| 1 — Foundation | Repo + tooling | ✅ Done |
| 2 — Core interface | Sidebar + chat shell (no AI yet) | ✅ Done |
| 3 — Anthropic integration | Real streaming chat | ⏳ In progress |
| 4 — Persistence | Conversations survive reload | Not started |
| 5 — Core productivity | Study mode, docs, coding polish | Not started |
| 6 — External tools | Search + images | Not started |
| 7 — Security & optimization | Harden before wider use | Not started |
| 8 — Testing & deployment | Ship it | Not started |

## Definition of done per phase

- **0:** API key verified working with a test SDK call.
- **1:** `npm run dev` runs a blank themed shell.
- **2:** UI fully navigable with mock data.
- **3:** A real message gets a real streamed Claude reply.
- **4:** Reload the page and history is still there.
- **5:** Can upload a PDF and ask a grounded question.
- **6:** A research query returns cited sources; an image prompt returns an image.
- **7:** A long conversation doesn't blow the context or the budget.
- **8:** App is reachable, documented, and every moving part is understood.

Update the Status column as phases complete — keep this file in sync with reality.
