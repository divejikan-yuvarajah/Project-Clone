# Personal Claude AI Clone

A personal AI workspace (chat, coding help, study mode, document analysis, research, and productivity tools) built on the Anthropic API, for personal use.

**Status:** Phase 1 — Project Foundation. See `docs/roadmap.md` for full phase tracking.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Anthropic API (`@anthropic-ai/sdk`) — streaming chat
- Supabase (Postgres + Auth + Storage)
- Deployed on Vercel

See `docs/architecture.md` for the full system design and `docs/requirements.md` for the complete feature list.

## Prerequisites

- Node.js 20 LTS or newer (see `.nvmrc`)
- npm (or pnpm)
- A Supabase project (free tier is enough) — supabase.com
- An Anthropic Console account with API credit — console.anthropic.com

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment template and fill in real values:
   ```bash
   cp .env.example .env.local
   ```
3. Apply the schema in `docs/database-schema.md` to your Supabase project (SQL editor → paste → run).
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. Open http://localhost:3000.

## Project docs

- `docs/requirements.md` — functional & non-functional requirements
- `docs/architecture.md` — system design, request lifecycle, folder structure, API routes
- `docs/roadmap.md` — phased implementation plan and current status
- `docs/database-schema.md` — Postgres schema
- `docs/security.md` — security & privacy checklist
- `AGENTS.md` — instructions for AI coding assistants working on this repo

## Scope

This is a solo, personal-use project. Features are built in strict MVP → V2 → V3 order — see `docs/roadmap.md`. No feature outside the current phase should be built ahead of schedule.
