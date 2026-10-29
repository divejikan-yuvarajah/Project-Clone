export function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold">Start a new conversation</h2>
      <p className="max-w-sm text-sm text-[var(--text-muted)]">
        Ask a question, paste some code, or describe what you&apos;re studying. Your message starts the conversation.
      </p>
    </div>
  );
}
