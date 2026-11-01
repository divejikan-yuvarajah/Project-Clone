import type { NextRequest } from 'next/server';
import { renameConversation, archiveConversation, deleteConversation } from '@/lib/db/conversations';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let body: { title?: string; isArchived?: boolean };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (body.title === undefined && body.isArchived === undefined) {
    return Response.json({ error: 'Provide title and/or isArchived.' }, { status: 400 });
  }

  try {
    const { id } = await params;
    if (typeof body.title === 'string' && body.title.trim().length > 0) {
      await renameConversation(id, body.title.trim().slice(0, 200));
    }
    if (body.isArchived === true) {
      await archiveConversation(id);
    }
    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update conversation.';
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteConversation(id);
    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete conversation.';
    return Response.json({ error: message }, { status: 500 });
  }
}
