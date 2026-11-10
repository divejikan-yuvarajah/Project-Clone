export interface GeneratedImage {
  bytes: Buffer;
  mimeType: 'image/png';
  model: string;
}

interface OpenAIImageResponse {
  data?: Array<{ b64_json?: unknown }>;
  error?: { message?: unknown };
}

const IMAGE_ENDPOINT = 'https://api.openai.com/v1/images/generations';

export async function generateImage(prompt: string, signal?: AbortSignal): Promise<GeneratedImage> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Server is missing OPENAI_API_KEY. Add it to .env.local and restart the dev server.',
    );
  }

  const model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2';
  const response = await fetch(IMAGE_ENDPOINT, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'medium',
      output_format: 'png',
    }),
    cache: 'no-store',
    signal,
  });

  const payload = (await response.json().catch(() => null)) as OpenAIImageResponse | null;
  if (!response.ok) {
    const detail =
      typeof payload?.error?.message === 'string'
        ? payload.error.message
        : `HTTP ${response.status}`;
    throw new Error(`Image provider request failed: ${detail}`);
  }

  const encoded = payload?.data?.[0]?.b64_json;
  if (typeof encoded !== 'string' || encoded.length === 0) {
    throw new Error('Image provider returned no image data.');
  }

  return { bytes: Buffer.from(encoded, 'base64'), mimeType: 'image/png', model };
}
