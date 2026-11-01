import { supabaseAdmin } from './supabase';
import type { ChatMessage, ConversationSummary } from '@/lib/types';

export interface ConversationWithMessages extends ConversationSummary {
  messages: ChatMessage[];
}

function deriveTitle(message: string): string {
  const words = message.trim().split(/\s+/);
  const slice = words.slice(0, 6).join(' ');
  return words.length > 6 ? `${slice}…` : slice || 'New conversation';
}

export async function listConversations(search?: string): Promise<ConversationSummary[]> {
  let query = supabaseAdmin
    .from('conversations')
    .select('id, title, model, updated_at')
    .eq('is_archived', false)
    .order('updated_at', { ascending: false });

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to list conversations: ${error.message}`);

  return (data ?? []).map((c) => ({ id: c.id, title: c.title, model: c.model, updatedAt: c.updated_at }));
}

export async function getConversationWithMessages(id: string): Promise<ConversationWithMessages | null> {
  const { data: conversation, error: convError } = await supabaseAdmin
    .from('conversations')
    .select('id, title, model, updated_at')
    .eq('id', id)
    .maybeSingle();

  if (convError) throw new Error(`Failed to load conversation: ${convError.message}`);
  if (!conversation) return null;

  const { data: messages, error: msgError } = await supabaseAdmin
    .from('messages')
    .select('id, role, content, created_at')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true });

  if (msgError) throw new Error(`Failed to load messages: ${msgError.message}`);

  return {
    id: conversation.id,
    title: conversation.title,
    model: conversation.model,
    updatedAt: conversation.updated_at,
    messages: (messages ?? []).map((m) => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.content,
      createdAt: m.created_at,
    })),
  };
}

export async function createConversation(firstUserMessage: string, model: string): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from('conversations')
    .insert({ title: deriveTitle(firstUserMessage), model })
    .select('id')
    .single();

  if (error) throw new Error(`Failed to create conversation: ${error.message}`);
  return data.id as string;
}

export async function renameConversation(id: string, title: string): Promise<void> {
  const { error } = await supabaseAdmin.from('conversations').update({ title }).eq('id', id);
  if (error) throw new Error(`Failed to rename conversation: ${error.message}`);
}

export async function archiveConversation(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from('conversations').update({ is_archived: true }).eq('id', id);
  if (error) throw new Error(`Failed to archive conversation: ${error.message}`);
}

export async function deleteConversation(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from('conversations').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete conversation: ${error.message}`);
}

export async function touchConversation(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(`Failed to update conversation timestamp: ${error.message}`);
}

export async function addMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  tokens?: { input?: number; output?: number },
): Promise<ChatMessage> {
  const { data, error } = await supabaseAdmin
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role,
      content,
      input_tokens: tokens?.input ?? null,
      output_tokens: tokens?.output ?? null,
    })
    .select('id, role, content, created_at')
    .single();

  if (error) throw new Error(`Failed to save message: ${error.message}`);

  return { id: data.id, role: data.role as 'user' | 'assistant', content: data.content, createdAt: data.created_at };
}

export async function logUsage(
  conversationId: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
  estimatedCostUsd: number,
): Promise<void> {
  const { error } = await supabaseAdmin.from('usage_log').insert({
    conversation_id: conversationId,
    model,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    estimated_cost_usd: estimatedCostUsd,
  });
  if (error) throw new Error(`Failed to log usage: ${error.message}`);
}
