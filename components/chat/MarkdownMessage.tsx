'use client';

import { useState, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function CodeBlock({ className, children }: { className?: string; children: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const language = /language-(\w+)/.exec(className ?? '')?.[1] ?? 'text';
  const code = String(children).replace(/\n$/, '');

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="my-2 overflow-hidden rounded-lg border border-[var(--border)]">
      <div className="flex items-center justify-between bg-[var(--code-header-bg)] px-3 py-1.5 text-xs text-[var(--text-muted)]">
        <span className="font-mono">{language}</span>
        <button onClick={copy} className="font-medium hover:text-[var(--text)]">
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto bg-[var(--code-bg)] px-3 py-2.5 text-xs leading-relaxed">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}

export function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="prose-chat">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const isBlock = /language-/.test(className ?? '') || String(children).includes('\n');
            if (isBlock) {
              return <CodeBlock className={className}>{children}</CodeBlock>;
            }
            return (
              <code className="rounded bg-[var(--code-bg)] px-1 py-0.5 font-mono text-[0.85em]" {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
