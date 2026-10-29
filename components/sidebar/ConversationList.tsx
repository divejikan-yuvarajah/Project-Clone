'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { MockConversation } from '@/lib/mock-data';

export function ConversationList({ conversations }: { conversations: MockConversation[] }) {
  const pathname = usePathname();

  if (conversations.length === 0) {
    return <p className="px-3 py-4 text-sm text-[var(--text-muted)]">No conversations match your search.</p>;
  }

  return (
    <ul className="flex flex-col gap-0.5 overflow-y-auto px-2">
      {conversations.map((c) => {
        const href = `/${c.id}`;
        const active = pathname === href;
        return (
          <li key={c.id}>
            <Link
              href={href}
              title={c.title}
              className={`block truncate rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? 'bg-[var(--accent-soft)] font-medium text-[var(--text)]'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]'
              }`}
            >
              {c.title}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
