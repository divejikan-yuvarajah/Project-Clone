import { notFound } from 'next/navigation';
import { ChatShell } from '@/components/chat/ChatShell';
import { listConversations, getConversationWithMessages } from '@/lib/db/conversations';

export default async function ConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params;
  const [conversations, conversation] = await Promise.all([
    listConversations(),
    getConversationWithMessages(conversationId),
  ]);

  if (!conversation) {
    notFound();
  }

  return (
    <ChatShell
      conversationId={conversation.id}
      conversations={conversations}
      initialMessages={conversation.messages}
      initialModel={conversation.model}
      initialTitle={conversation.title}
    />
  );
}
