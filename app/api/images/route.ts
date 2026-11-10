import { randomUUID } from 'crypto';
import { supabaseAdmin } from '@/lib/db/supabase';
import { generateImage } from '@/lib/providers/image';

export const runtime = 'nodejs';

const MAX_PROMPT_LENGTH = 2000;
const STORAGE_BUCKET = 'attachments';

interface ImageRequest {
  prompt?: unknown;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as ImageRequest | null;
  const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';

  if (!prompt) {
    return Response.json({ error: 'Image prompt is required.' }, { status: 400 });
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return Response.json(
      { error: `Image prompt is too long (max ${MAX_PROMPT_LENGTH} characters).` },
      { status: 400 },
    );
  }

  try {
    const generated = await generateImage(prompt, req.signal);
    const storagePath = `generated/${randomUUID()}.png`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, generated.bytes, { contentType: generated.mimeType, upsert: false });

    if (uploadError) {
      throw new Error(`Failed to store generated image: ${uploadError.message}`);
    }

    const { data, error: signedUrlError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(storagePath, 60 * 60);

    if (signedUrlError) {
      throw new Error(`Failed to create image URL: ${signedUrlError.message}`);
    }

    return Response.json({ imageUrl: data.signedUrl, prompt, model: generated.model });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Image generation failed.';
    const aborted = error instanceof Error && error.name === 'AbortError';
    return Response.json(
      { error: aborted ? 'Image generation was cancelled.' : message },
      { status: aborted ? 499 : 500 },
    );
  }
}
