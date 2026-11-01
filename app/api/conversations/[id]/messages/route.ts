import { getConversationWithMessages } from '@/lib/db/conversations';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const conversation = await getConversationWithMessages(id);
    if (!conversation) {
      return Response.json({ error: 'Conversation not found.' }, { status: 404 });
    }
    return Response.json({ messages: conversation.messages });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load messages.';
    return Response.json({ error: message }, { status: 500 });
  }
}
