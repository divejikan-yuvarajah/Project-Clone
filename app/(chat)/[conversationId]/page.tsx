import { ChatShell } from '@/components/chat/ChatShell';

export default function ConversationPage({ params }: { params: { conversationId: string } }) {
  return <ChatShell conversationId={params.conversationId} />;
}
