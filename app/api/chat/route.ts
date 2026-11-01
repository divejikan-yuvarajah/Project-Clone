import type { NextRequest } from 'next/server';
import { anthropic, DEFAULT_SYSTEM_PROMPT } from '@/lib/anthropic/client';
import {
  createConversation,
  getConversationWithMessages,
  addMessage,
  touchConversation,
  logUsage,
} from '@/lib/db/conversations';
import { linkAttachmentsToMessage, getAttachmentsForMessages } from '@/lib/db/attachments';
import { estimateCostUsd } from '@/lib/costs';

export const runtime = 'nodejs';

const MAX_MESSAGE_LENGTH = 8000;
const MAX_OUTPUT_TOKENS = 2048;
const ALLOWED_MODELS = new Set(['claude-haiku-5-5', 'claude-sonnet-5', 'claude-opus-5-5']);

interface ChatRequestBody {
  conversationId?: string | null;
  model?: string;
  message?: string;
  attachmentIds?: string[];
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: 'Server is missing ANTHROPIC_API_KEY. Add it to .env.local and restart the dev server.' },
      { status: 500 },
    );
  }

  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { model, message } = body;
  let { conversationId } = body;
  const attachmentIds = Array.isArray(body.attachmentIds)
    ? body.attachmentIds.filter((id): id is string => typeof id === 'string')
    : [];

  if (!model || !ALLOWED_MODELS.has(model)) {
    return Response.json({ error: 'Unknown or missing model.' }, { status: 400 });
  }
  if (typeof message !== 'string' || message.trim().length === 0) {
    return Response.json({ error: 'Message is empty.' }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return Response.json(
      { error: `Message is too long (max ${MAX_MESSAGE_LENGTH} characters).` },
      { status: 400 },
    );
  }

  let history: { role: 'user' | 'assistant'; content: string }[] = [];
  let priorMessageIds: string[] = [];

  try {
    if (conversationId) {
      const existing = await getConversationWithMessages(conversationId);
      if (!existing) {
        return Response.json({ error: 'Conversation not found.' }, { status: 404 });
      }
      history = existing.messages.map((m) => ({ role: m.role, content: m.content }));
      priorMessageIds = existing.messages.map((m) => m.id);
    } else {
      conversationId = await createConversation(message, model);
    }

    const userMessageRow = await addMessage(conversationId, 'user', message);
    if (attachmentIds.length > 0) {
      await linkAttachmentsToMessage(attachmentIds, userMessageRow.id);
    }
    priorMessageIds.push(userMessageRow.id);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Database error while starting the conversation.';
    return Response.json({ error: msg }, { status: 500 });
  }

  // Every document attached anywhere in this conversation stays "in context"
  // for every turn — not just the message it was attached to.
  const documents = await getAttachmentsForMessages(priorMessageIds).catch(() => []);
  const systemPrompt =
    documents.length > 0
      ? `${DEFAULT_SYSTEM_PROMPT}\n\nThe user has shared the following document(s) in this conversation. Ground your answers in them when relevant, and say clearly if something isn't covered.\n\n${documents
          .map((d) => `--- ${d.fileName} ---\n${d.extractedText}`)
          .join('\n\n')}`
      : DEFAULT_SYSTEM_PROMPT;

  const encoder = new TextEncoder();
  const finalConversationId = conversationId;

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: Record<string, unknown>) {
        controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'));
      }

      send({ type: 'conversation', id: finalConversationId });

      const anthropicStream = anthropic.messages.stream(
        {
          model,
          max_tokens: MAX_OUTPUT_TOKENS,
          system: systemPrompt,
          messages: [...history, { role: 'user', content: message }],
        },
        { signal: req.signal },
      );

      let fullText = '';
      anthropicStream.on('text', (delta) => {
        fullText += delta;
        send({ type: 'delta', text: delta });
      });

      try {
        const finalMessage = await anthropicStream.finalMessage();
        const inputTokens = finalMessage.usage.input_tokens;
        const outputTokens = finalMessage.usage.output_tokens;

        if (fullText.length > 0) {
          await addMessage(finalConversationId, 'assistant', fullText, {
            input: inputTokens,
            output: outputTokens,
          });
        }
        await touchConversation(finalConversationId);
        await logUsage(
          finalConversationId,
          model,
          inputTokens,
          outputTokens,
          estimateCostUsd(model, inputTokens, outputTokens),
        );

        send({ type: 'done', usage: { inputTokens, outputTokens } });
      } catch (err: unknown) {
        const errWithMeta = err as { name?: string; status?: number; message?: string };
        if (errWithMeta?.name === 'APIUserAbortError' || errWithMeta?.name === 'AbortError') {
          if (fullText.length > 0) {
            await addMessage(finalConversationId, 'assistant', fullText).catch(() => {});
          }
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
