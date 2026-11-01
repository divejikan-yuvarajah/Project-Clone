'use client';

import { useRef, useState, type KeyboardEvent, type ChangeEvent } from 'react';
import type { MessageAttachment } from '@/lib/types';
import { AttachmentChip } from './AttachmentChip';

export function Composer({
  onSend,
  disabled,
  onStop,
}: {
  onSend: (text: string, attachments?: MessageAttachment[]) => void;
  disabled: boolean;
  onStop: () => void;
}) {
  const [value, setValue] = useState('');
  const [staged, setStaged] = useState<MessageAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function send() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed, staged.length > 0 ? staged : undefined);
    setValue('');
    setStaged([]);
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/uploads', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? 'Upload failed.');
      setStaged((prev) => [...prev, { id: data.id, fileName: data.fileName }]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  }

  function removeStaged(id: string) {
    setStaged((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="border-t border-[var(--border)] bg-[var(--bg)] px-4 py-3">
      <div className="mx-auto max-w-3xl">
        {uploadError && <p className="mb-1.5 text-xs text-[var(--error-text)]">{uploadError}</p>}

        {staged.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {staged.map((a) => (
              <AttachmentChip key={a.id} fileName={a.fileName} onRemove={() => removeStaged(a.id)} />
            ))}
          </div>
        )}

        <div className="flex items-end gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            aria-label="Attach a PDF"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-[var(--bg)] hover:text-[var(--text)] disabled:opacity-40"
          >
            {isUploading ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--text-muted)] border-t-transparent" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.44 11.05 12.25 20.24a5 5 0 0 1-7.07-7.07l9.19-9.19a3.33 3.33 0 0 1 4.71 4.71l-9.2 9.19a1.67 1.67 0 0 1-2.36-2.36l8.49-8.48" />
              </svg>
            )}
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
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md gradient-accent text-[var(--accent-foreground)] transition-opacity disabled:opacity-40"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          )}
        </div>
        <p className="mt-1.5 text-center text-xs text-[var(--text-muted)]">
          Enter to send · Shift+Enter for a new line · PDF attachments up to 10 MB
        </p>
      </div>
    </div>
  );
}
