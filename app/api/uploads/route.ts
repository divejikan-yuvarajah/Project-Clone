import { randomUUID } from 'crypto';
import { supabaseAdmin } from '@/lib/db/supabase';
import { extractTextFromPdf } from '@/lib/pdf';
import { createAttachment } from '@/lib/db/attachments';

export const runtime = 'nodejs';

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_EXTRACTED_CHARS = 12000;
const STORAGE_BUCKET = 'attachments';

export async function POST(req: Request) {
  const formData = await req.formData().catch(() => null);
  const file = formData?.get('file');

  if (!(file instanceof File)) {
    return Response.json({ error: 'No file provided.' }, { status: 400 });
  }
  if (file.type !== 'application/pdf') {
    return Response.json({ error: 'Only PDF files are supported right now.' }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return Response.json({ error: 'File is larger than the 10 MB limit.' }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    let extractedText: string;
    try {
      extractedText = await extractTextFromPdf(buffer);
    } catch {
      return Response.json(
        { error: 'Could not read text from that PDF — it may be scanned or corrupted.' },
        { status: 422 },
      );
    }

    if (extractedText.length === 0) {
      return Response.json(
        { error: 'No readable text found in that PDF (it may be scanned images rather than text).' },
        { status: 422 },
      );
    }

    const storagePath = `${randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, { contentType: file.type });

    if (uploadError) {
      return Response.json({ error: `Failed to store file: ${uploadError.message}` }, { status: 500 });
    }

    const truncated = extractedText.length > MAX_EXTRACTED_CHARS;
    const attachment = await createAttachment({
      fileName: file.name,
      storagePath,
      mimeType: file.type,
      sizeBytes: file.size,
      extractedText: truncated ? extractedText.slice(0, MAX_EXTRACTED_CHARS) : extractedText,
    });

    return Response.json({ id: attachment.id, fileName: attachment.fileName, truncated });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to process the upload.';
    return Response.json({ error: message }, { status: 500 });
  }
}
