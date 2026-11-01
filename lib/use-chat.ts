'use client';

import { useCallback, useRef, useState } from 'react';
import type { ChatMessage, MessageAttachment } from './types';

interface UseChatOptions {
  conversationId: string | null;
  initialMessages: ChatMessage[];
  model: string;
  onConversationCreated?: (id: string) => void;
}

export function useChat({ conversationId, initialMessages, model, onConversationCreated }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async (text: string, attachments?: MessageAttachment[]) => {
      setError(null);
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text,
        createdAt: new Date().toISOString(),
        attachments,
      };
      const assistantId = crypto.randomUUID();

      setMessages((prev) => [
        ...prev,
        userMessage,
        { id: assistantId, role: 'assistant', content: '', createdAt: new Date().toISOString() },
      ]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;
      let createdConversationId: string | null = null;

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            conversationId,
            model,
            message: text,
            attachmentIds: attachments?.map((a) => a.id) ?? [],
          }),
        });

        if (!response.ok || !response.body) {
          const parsed = await response.json().catch(() => null);
          throw new Error(parsed?.error ?? `Request failed with status ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.trim()) continue;
            const event = JSON.parse(line) as {
              type: string;
              text?: string;
              message?: string;
              id?: string;
            };

            if (event.type === 'conversation' && event.id && !conversationId) {
              createdConversationId = event.id;
            } else if (event.type === 'delta' && event.text) {
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + event.text } : m)),
              );
            } else if (event.type === 'error') {
              throw new Error(event.message ?? 'Something went wrong talking to Claude.');
            }
          }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          // User clicked stop — not an error state.
        } else {
          const message = err instanceof Error ? err.message : 'Something went wrong talking to Claude.';
          setError(message);
          setMessages((prev) => prev.filter((m) => m.id !== assistantId || m.content.length > 0));
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
        if (createdConversationId) {
          onConversationCreated?.(createdConversationId);
        }
      }
    },
    [conversationId, model, onConversationCreated],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { messages, isStreaming, error, send, stop, setError };
}
