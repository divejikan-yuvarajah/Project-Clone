export interface SearchSource {
  title: string;
  url: string;
  content: string;
  score: number | null;
}

interface TavilyResult {
  title?: unknown;
  url?: unknown;
  content?: unknown;
  score?: unknown;
}

interface TavilyResponse {
  results?: TavilyResult[];
}

const SEARCH_ENDPOINT = 'https://api.tavily.com/search';

export async function searchWeb(query: string, signal?: AbortSignal): Promise<SearchSource[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Server is missing TAVILY_API_KEY. Add it to .env.local and restart the dev server.',
    );
  }

  const response = await fetch(SEARCH_ENDPOINT, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query,
      search_depth: 'basic',
      max_results: 6,
      include_answer: false,
      include_raw_content: false,
      include_published_date: true,
      safe_search: true,
    }),
    cache: 'no-store',
    signal,
  });

  const payload = (await response.json().catch(() => null)) as
    (TavilyResponse & { detail?: unknown }) | null;
  if (!response.ok) {
    const detail = typeof payload?.detail === 'string' ? payload.detail : `HTTP ${response.status}`;
    throw new Error(`Search provider request failed: ${detail}`);
  }

  return (payload?.results ?? []).flatMap((result) => {
    if (
      typeof result.title !== 'string' ||
      typeof result.url !== 'string' ||
      typeof result.content !== 'string'
    ) {
      return [];
    }

    return [
      {
        title: result.title,
        url: result.url,
        content: result.content,
        score: typeof result.score === 'number' ? result.score : null,
      },
    ];
  });
}
