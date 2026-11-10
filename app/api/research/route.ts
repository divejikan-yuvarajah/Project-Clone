import { anthropic } from '@/lib/anthropic/client';
import { searchWeb } from '@/lib/providers/search';

export const runtime = 'nodejs';

const MAX_QUERY_LENGTH = 1000;
const RESEARCH_MODEL = process.env.RESEARCH_MODEL || 'claude-sonnet-5';

interface ResearchRequest {
  query?: unknown;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as ResearchRequest | null;
  const query = typeof body?.query === 'string' ? body.query.trim() : '';

  if (!query) {
    return Response.json({ error: 'Research query is required.' }, { status: 400 });
  }
  if (query.length > MAX_QUERY_LENGTH) {
    return Response.json(
      { error: `Research query is too long (max ${MAX_QUERY_LENGTH} characters).` },
      { status: 400 },
    );
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      {
        error:
          'Server is missing ANTHROPIC_API_KEY. Add it to .env.local and restart the dev server.',
      },
      { status: 500 },
    );
  }

  try {
    const sources = await searchWeb(query, req.signal);
    if (sources.length === 0) {
      return Response.json(
        { error: 'No relevant sources were found. Try a more specific query.' },
        { status: 404 },
      );
    }

    const sourceContext = sources
      .map(
        (source, index) =>
          `[${index + 1}] ${source.title}\nURL: ${source.url}\n${source.content.slice(0, 3000)}`,
      )
      .join('\n\n');

    const response = await anthropic.messages.create(
      {
        model: RESEARCH_MODEL,
        max_tokens: 1400,
        system:
          'You are a careful research assistant. Answer only from the supplied web sources. Cite every factual claim with one or more source numbers in square brackets, such as [1] or [2][3]. Never invent a citation. If the sources do not answer the question, say so clearly.',
        messages: [
          {
            role: 'user',
            content: `Research question: ${query}\n\nSources:\n${sourceContext}`,
          },
        ],
      },
      { signal: req.signal },
    );

    const answer = response.content
      .filter(
        (block): block is Extract<(typeof response.content)[number], { type: 'text' }> =>
          block.type === 'text',
      )
      .map((block) => block.text)
      .join('\n\n')
      .trim();

    if (!answer) {
      throw new Error('Claude returned an empty research answer.');
    }

    const citationNumbers = [...answer.matchAll(/\[(\d+)\]/g)].map((match) => Number(match[1]));
    if (
      citationNumbers.length === 0 ||
      citationNumbers.some((number) => number < 1 || number > sources.length)
    ) {
      throw new Error(
        'Claude returned an answer without valid source citations. Please try the research query again.',
      );
    }

    return Response.json({
      answer,
      sources: sources.map(({ title, url }) => ({ title, url })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Research request failed.';
    const aborted =
      error instanceof Error && (error.name === 'AbortError' || error.name === 'APIUserAbortError');
    return Response.json(
      { error: aborted ? 'Research request was cancelled.' : message },
      { status: aborted ? 499 : 500 },
    );
  }
}
