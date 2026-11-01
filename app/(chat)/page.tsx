import { ChatShell } from '@/components/chat/ChatShell';
import { listConversations } from '@/lib/db/conversations';

export default async function ChatHomePage() {
  const conversations = await listConversations();

  return (
    <ChatShell
      conversationId={null}
      conversations={conversations}
      initialMessages={[]}
      initialModel="claude-sonnet-5"
      initialTitle={null}
    />
  );
}
