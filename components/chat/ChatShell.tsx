'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { MessageList } from './MessageList';
import { Composer } from './Composer';
import { ModelPicker } from './ModelPicker';
import { mockConversations, getConversation } from '@/lib/mock-data';
import { useChat } from '@/lib/use-chat';

export function ChatShell({ conversationId }: { conversationId: string | null }) {
  const initial = conversationId ? getConversation(conversationId) : null;
  const [model, setModel] = useState(initial?.model ?? 'claude-sonnet-5');

  const { messages, isStreaming, error, send, stop, setError } = useChat(initial?.messages ?? [], model);

  return (
    <div className="flex h-screen w-full bg-[var(--bg)] text-[var(--text)]">
      <Sidebar conversations={mockConversations} />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2.5">
          <span className="truncate text-sm font-medium text-[var(--text-muted)]">
            {initial?.title ?? 'New conversation'}
          </span>
          <ModelPicker value={model} onChange={setModel} />
        </div>

        {error && (
          <div className="mx-4 mt-2 flex items-center justify-between rounded-md border border-[var(--error-border)] bg-[var(--error-bg)] px-3 py-2 text-sm text-[var(--error-text)]">
            <span>{error}</span>
            <button onClick={() => setError(null)} aria-label="Dismiss error" className="font-medium">
              Dismiss
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <MessageList messages={messages} />
        </div>

        <Composer onSend={send} disabled={isStreaming} onStop={stop} />
      </div>
    </div>
  );
}
