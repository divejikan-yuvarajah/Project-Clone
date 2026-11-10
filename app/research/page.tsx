import { ResearchWorkspace } from '@/components/research/ResearchWorkspace';
import { listConversations } from '@/lib/db/conversations';

export const dynamic = 'force-dynamic';

export default async function ResearchPage() {
  const conversations = await listConversations();
  return <ResearchWorkspace conversations={conversations} />;
}
