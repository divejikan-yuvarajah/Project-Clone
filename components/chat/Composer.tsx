'use client';

import { useRef, useState, type KeyboardEvent } from 'react';

export function Composer({
  onSend,
  disabled,
  onStop,
}: {
  onSend: (text: string) => void;
  disabled: boolean;
  onStop: () => void;
}) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function send() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="border-t border-[var(--border)] bg-[var(--bg)] px-4 py-3">
      <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-2">
        <button
          aria-label="Attach file"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.44 11.05 12.25 20.24a5 5 0 0 1-7.07-7.07l9.19-9.19a3.33 3.33 0 0 1 4.71 4.71l-9.2 9.19a1.67 1.67 0 0 1-2.36-2.36l8.49-8.48" />
          </svg>
        </button>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Message your workspace..."
          className="max-h-40 flex-1 resize-none bg-transparent py-1.5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none"
        />

        {disabled ? (
          <button
            onClick={onStop}
            aria-label="Stop generating"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--text)] text-[var(--bg)]"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          </button>
        ) : (
          <button
            onClick={send}
            disabled={!value.trim()}
            aria-label="Send message"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--accent)] text-[var(--accent-foreground)] transition-opacity disabled:opacity-40"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        )}
      </div>
      <p className="mx-auto mt-1.5 max-w-3xl text-center text-xs text-[var(--text-muted)]">
        Enter to send · Shift+Enter for a new line
      </p>
    </div>
  );
}
