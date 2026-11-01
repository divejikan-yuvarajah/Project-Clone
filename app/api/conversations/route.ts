import type { NextRequest } from 'next/server';
import { listConversations } from '@/lib/db/conversations';

// Conversations are created implicitly by POST /api/chat on a user's first
// message — there's no separate "create empty conversation" endpoint.

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('q') ?? undefined;
  try {
    const conversations = await listConversations(search);
    return Response.json({ conversations });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load conversations.';
    return Response.json({ error: message }, { status: 500 });
  }
}
