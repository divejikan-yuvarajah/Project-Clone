export function AttachmentChip({ fileName, onRemove }: { fileName: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex max-w-[220px] items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1 text-xs text-[var(--text-muted)]">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="shrink-0"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6" />
      </svg>
      <span className="truncate">{fileName}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          aria-label={`Remove ${fileName}`}
          className="shrink-0 text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          ×
        </button>
      )}
    </span>
  );
}
