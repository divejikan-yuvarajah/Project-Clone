# Architecture

## Request lifecycle (chat message)

```
Browser (Next.js UI)
   │  POST /api/chat  { conversationId, message, model }
   ▼
Next.js Route Handler (server-side only)
   │  1. Validate session / request shape
   │  2. Load conversation history from Postgres (Supabase)
   │  3. Build message array + system prompt
   ▼
Anthropic SDK (@anthropic-ai/sdk), server-side, API key from env var
   │  Streams tokens back via SSE
   ▼
Route Handler re-streams chunks to the browser
   ▼
Browser renders streaming markdown/code, then
   persists the final assistant message back to Postgres
```

Supporting services follow the same pattern (their own Route Handlers): document upload → extraction → Supabase Storage; web search → search provider → Claude for summarization/citation; image generation → image provider → Supabase Storage for the result.

## Layers

- **UI layer:** Next.js pages/components. No secrets. Talks only to this app's own `/api/*` routes.
- **API layer:** Route Handlers — the only place holding the Anthropic key, DB credentials, and any third-party keys.
- **Provider adapter layer:** one small module per external capability (`anthropicClient`, `searchProvider`, `imageProvider`), so swapping a provider later touches one file.
- **Persistence layer:** Supabase Postgres (structured data) + Supabase Storage (files).

## Folder structure

```
personal-claude-clone/
├── app/
│   ├── (chat)/
│   │   ├── page.tsx
│   │   └── [conversationId]/page.tsx
│   ├── study/page.tsx          (V2)
│   ├── research/page.tsx       (V2)
│   ├── settings/page.tsx
│   └── api/
│       ├── chat/route.ts
│       ├── conversations/route.ts
│       ├── conversations/[id]/route.ts
│       ├── usage/route.ts
│       └── uploads/route.ts    (V2)
├── components/
│   ├── chat/      (MessageList, Composer, ModelPicker, StreamingMessage)
│   ├── sidebar/
│   └── ui/        (shared design-system primitives)
├── lib/
│   ├── anthropic/client.ts     — the only file that imports the Anthropic SDK
│   ├── db/                     — Supabase client + queries
│   ├── providers/
│   │   ├── search.ts           (V2)
│   │   └── image.ts            (V2)
│   └── costs.ts                — token → USD estimate helper
├── docs/
├── AGENTS.md
├── README.md
├── .env.example
└── package.json
```

## API endpoints (V1)

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/chat` | Send a message, stream the response, log usage |
| GET | `/api/conversations` | List conversations (with search/filter params) |
| POST | `/api/conversations` | Create a new conversation |
| PATCH | `/api/conversations/:id` | Rename / archive a conversation |
| DELETE | `/api/conversations/:id` | Delete a conversation |
| GET | `/api/conversations/:id/messages` | Load message history |
| POST | `/api/conversations/:id/export` | Export as Markdown/JSON |
| GET | `/api/usage` | Usage/cost summary for the dashboard |

Every route runs server-side only. None of them ever return an API key to the client.
