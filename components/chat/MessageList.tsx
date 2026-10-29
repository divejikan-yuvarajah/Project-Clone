'use client';

import { useEffect, useRef } from 'react';
import type { ChatMessage } from '@/lib/types';
import { MessageBubble, ThinkingBubble } from './MessageBubble';
import { EmptyState } from './EmptyState';

export function MessageList({ messages }: { messages: ChatMessage[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastContent = messages[messages.length - 1]?.content;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, lastContent]);

  if (messages.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
      {messages.map((m) =>
        m.role === 'assistant' && m.content.length === 0 ? (
          <ThinkingBubble key={m.id} />
        ) : (
          <MessageBubble key={m.id} message={m} />
        ),
      )}
      <div ref={bottomRef} />
    </div>
  );
}
