'use client';

import { useState, type FormEvent } from 'react';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { MarkdownMessage } from '@/components/chat/MarkdownMessage';
import type { ConversationSummary } from '@/lib/types';

interface SourceLink {
  title: string;
  url: string;
}

type Mode = 'research' | 'image';

export function ResearchWorkspace({ conversations }: { conversations: ConversationSummary[] }) {
  const [mode, setMode] = useState<Mode>('research');
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<SourceLink[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [imageModel, setImageModel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const prompt = query.trim();
    if (!prompt || loading) return;

    setError(null);
    setLoading(true);

    try {
      const endpoint = mode === 'research' ? '/api/research' : '/api/images';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(mode === 'research' ? { query: prompt } : { prompt }),
      });
      const data = (await response.json().catch(() => null)) as {
        error?: string;
        answer?: string;
        sources?: SourceLink[];
        imageUrl?: string;
        model?: string;
      } | null;

      if (!response.ok) {
        throw new Error(data?.error ?? `Request failed with status ${response.status}`);
      }

      if (mode === 'research') {
        setAnswer(data?.answer ?? '');
        setSources(data?.sources ?? []);
      } else {
        setImageUrl(data?.imageUrl ?? '');
        setImageModel(data?.model ?? '');
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Request failed.');
    } finally {
      setLoading(false);
    }
  }

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setError(null);
    setQuery('');
  }

  return (
    <div className="flex h-screen w-full bg-[var(--bg)] text-[var(--text)]">
      <Sidebar conversations={conversations} />

      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col px-5 py-8 sm:px-8">
          <div className="mb-7">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              External tools
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">Research and create</h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
              Search the web with traceable sources or turn a written prompt into an image.
            </p>
          </div>

          <div className="mb-5 flex w-fit rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-1">
            {(['research', 'image'] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => switchMode(item)}
                className={`rounded-md px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  mode === item
                    ? 'gradient-accent text-[var(--accent-foreground)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <form
            onSubmit={submit}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4"
          >
            <label htmlFor="external-tool-prompt" className="mb-2 block text-sm font-medium">
              {mode === 'research'
                ? 'What do you want to research?'
                : 'What image do you want to create?'}
            </label>
            <textarea
              id="external-tool-prompt"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              rows={4}
              maxLength={mode === 'research' ? 1000 : 2000}
              placeholder={
                mode === 'research'
                  ? 'Compare the latest approaches to retrieval-augmented generation...'
                  : 'A calm editorial illustration of a futuristic study desk at dusk...'
              }
              className="w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
            <div className="mt-3 flex items-center justify-between gap-4">
              <span className="text-xs text-[var(--text-muted)]">
                {mode === 'research'
                  ? 'Answers include numbered source links.'
                  : 'Generated images are stored privately for one hour.'}
              </span>
              <button
                type="submit"
                disabled={!query.trim() || loading}
                className="rounded-md gradient-accent px-4 py-2 text-sm font-medium text-[var(--accent-foreground)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? mode === 'research'
                    ? 'Researching…'
                    : 'Generating…'
                  : mode === 'research'
                    ? 'Research'
                    : 'Generate'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-5 rounded-lg border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error-text)]">
              {error}
            </div>
          )}

          {mode === 'research' && answer && (
            <section className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
              <h2 className="mb-4 text-sm font-semibold">Research answer</h2>
              <MarkdownMessage content={answer} />
              <div className="mt-6 border-t border-[var(--border)] pt-4">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Sources
                </h3>
                <ol className="space-y-2">
                  {sources.map((source, index) => (
                    <li key={source.url} className="text-sm">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--accent)] underline decoration-transparent underline-offset-4 hover:decoration-current"
                      >
                        [{index + 1}] {source.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          )}

          {mode === 'image' && imageUrl && (
            <section className="mt-6 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]">
              {/* The URL is a short-lived Supabase signed URL whose host is project-specific. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={query || 'Generated image'}
                className="aspect-square w-full object-contain"
              />
              <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] px-4 py-3 text-xs text-[var(--text-muted)]">
                <span>Generated with {imageModel || 'the configured image provider'}</span>
                <a
                  href={imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-[var(--accent)]"
                >
                  Open image
                </a>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
