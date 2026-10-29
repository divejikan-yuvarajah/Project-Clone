'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ConversationList } from './ConversationList';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import type { MockConversation } from '@/lib/mock-data';

export function Sidebar({ conversations }: { conversations: MockConversation[] }) {
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  const filtered = conversations.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()));

  if (collapsed) {
    return (
      <div className="flex w-14 shrink-0 flex-col items-center gap-3 border-r border-[var(--border)] bg-[var(--bg)] py-3">
        <button
          onClick={() => setCollapsed(false)}
          aria-label="Expand sidebar"
          className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 3v18M3 3h18v18H3Z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-72 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--bg)]">
      <div className="flex items-center justify-between gap-2 px-3 py-3">
        <span className="text-sm font-semibold tracking-tight">Personal Workspace</span>
        <button
          onClick={() => setCollapsed(true)}
          aria-label="Collapse sidebar"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 3v18M3 3h18v18H3Z" />
          </svg>
        </button>
      </div>

      <div className="px-3 pb-2">
        <Link
          href="/"
          className="flex w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-medium text-[var(--accent-foreground)] transition-opacity hover:opacity-90"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New chat
        </Link>
      </div>

      <div className="px-3 pb-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search conversations"
          className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1.5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
      </div>

      <ConversationList conversations={filtered} />

      <div className="mt-auto flex items-center justify-between border-t border-[var(--border)] px-3 py-3">
        <Link href="/settings" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)]">
          Settings
        </Link>
        <ThemeToggle />
      </div>
    </div>
  );
}
