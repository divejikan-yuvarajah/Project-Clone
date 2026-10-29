import type { NextRequest } from 'next/server';
import { anthropic, DEFAULT_SYSTEM_PROMPT } from '@/lib/anthropic/client';

export const runtime = 'nodejs';

const MAX_MESSAGE_LENGTH = 8000;
const MAX_OUTPUT_TOKENS = 2048;
const ALLOWED_MODELS = new Set(['claude-haiku-5-5', 'claude-sonnet-5', 'claude-opus-5-5']);

interface IncomingMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: 'Server is missing ANTHROPIC_API_KEY. Add it to .env.local and restart the dev server.' },
      { status: 500 },
    );
  }

  let body: { model?: string; messages?: IncomingMessage[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { model, messages } = body;

  if (!model || !ALLOWED_MODELS.has(model)) {
    return Response.json({ error: 'Unknown or missing model.' }, { status: 400 });
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: 'messages must be a non-empty array.' }, { status: 400 });
  }
  const lastMessage = messages[messages.length - 1];
  if (typeof lastMessage?.content !== 'string' || lastMessage.content.length === 0) {
    return Response.json({ error: 'Last message content is empty.' }, { status: 400 });
  }
  if (lastMessage.content.length > MAX_MESSAGE_LENGTH) {
    return Response.json(
      { error: `Message is too long (max ${MAX_MESSAGE_LENGTH} characters).` },
      { status: 400 },
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: Record<string, unknown>) {
        controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'));
      }

      // Forwarding the request's abort signal lets us stop paying for tokens
      // the moment the client disconnects or clicks "stop".
      const anthropicStream = anthropic.messages.stream(
        {
          model,
          max_tokens: MAX_OUTPUT_TOKENS,
          system: DEFAULT_SYSTEM_PROMPT,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        },
        { signal: req.signal },
      );

      anthropicStream.on('text', (delta) => send({ type: 'delta', text: delta }));

      try {
        const finalMessage = await anthropicStream.finalMessage();
        send({
          type: 'done',
          usage: {
            inputTokens: finalMessage.usage.input_tokens,
            outputTokens: finalMessage.usage.output_tokens,
          },
        });
      } catch (err: unknown) {
        const errWithMeta = err as { name?: string; status?: number; message?: string };
        if (errWithMeta?.name === 'APIUserAbortError' || errWithMeta?.name === 'AbortError') {
          // User-initiated stop — nothing to report.
        } else if (errWithMeta?.status) {
          send({
            type: 'error',
            message: `Anthropic API error (${errWithMeta.status}): ${errWithMeta.message ?? 'request failed'}`,
          });
        } else {
          send({ type: 'error', message: 'Unexpected error while contacting Claude.' });
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-cache' },
  });
}
