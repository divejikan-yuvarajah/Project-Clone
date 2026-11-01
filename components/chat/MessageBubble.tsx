import type { ChatMessage } from '@/lib/types';
import { MarkdownMessage } from './MarkdownMessage';
import { AttachmentChip } from './AttachmentChip';

function Avatar({ role }: { role: 'user' | 'assistant' }) {
  if (role === 'assistant') {
    return (
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full gradient-accent text-[11px] font-semibold text-[var(--accent-foreground)]">
        AI
      </div>
    );
  }
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] text-[11px] font-semibold text-[var(--text-muted)]">
      You
    </div>
  );
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      <Avatar role={message.role} />
      <div className={`flex max-w-[75ch] flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.attachments.map((a) => (
              <AttachmentChip key={a.id} fileName={a.fileName} />
            ))}
          </div>
        )}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? 'gradient-accent text-[var(--accent-foreground)]'
              : 'border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text)]'
          }`}
        >
          {isUser ? (
            <span className="whitespace-pre-wrap">{message.content}</span>
          ) : (
            <MarkdownMessage content={message.content} />
          )}
        </div>
      </div>
    </div>
  );
}

// Shown in place of a bubble while an assistant message is still empty.
export function ThinkingBubble() {
  return (
    <div className="flex items-start gap-2.5">
      <Avatar role="assistant" />
      <div className="flex items-center gap-1 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3">
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
