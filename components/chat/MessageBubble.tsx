import type { ChatMessage } from '@/lib/types';

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75ch] whitespace-pre-wrap rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
            : 'border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text)]'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

// Shown in place of a bubble while an assistant message is still empty —
// i.e. the request has been sent but no tokens have streamed back yet.
export function ThinkingBubble() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-muted)]"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
