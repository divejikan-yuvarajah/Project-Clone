import { supabaseAdmin } from './supabase';

export interface AttachmentRecord {
  id: string;
  fileName: string;
  extractedText: string;
}

export async function createAttachment(params: {
  fileName: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  extractedText: string;
}): Promise<AttachmentRecord> {
  const { data, error } = await supabaseAdmin
    .from('attachments')
    .insert({
      file_name: params.fileName,
      storage_path: params.storagePath,
      mime_type: params.mimeType,
      size_bytes: params.sizeBytes,
      extracted_text: params.extractedText,
    })
    .select('id, file_name, extracted_text')
    .single();

  if (error) throw new Error(`Failed to save attachment: ${error.message}`);
  return { id: data.id, fileName: data.file_name, extractedText: data.extracted_text ?? '' };
}

// Attachments are uploaded (and extracted) before the message that references
// them exists, so we link them here once the real message row is created.
export async function linkAttachmentsToMessage(attachmentIds: string[], messageId: string): Promise<void> {
  if (attachmentIds.length === 0) return;
  const { error } = await supabaseAdmin
    .from('attachments')
    .update({ message_id: messageId })
    .in('id', attachmentIds);
  if (error) throw new Error(`Failed to link attachments: ${error.message}`);
}

// Pulls every document attached anywhere among the given message ids, so a
// PDF stays "in context" for the whole conversation, not just the one turn
// it was attached on.
export async function getAttachmentsForMessages(
  messageIds: string[],
): Promise<{ fileName: string; extractedText: string }[]> {
  if (messageIds.length === 0) return [];
  const { data, error } = await supabaseAdmin
    .from('attachments')
    .select('file_name, extracted_text')
    .in('message_id', messageIds);
  if (error) throw new Error(`Failed to load attachments: ${error.message}`);
  return (data ?? []).map((a) => ({ fileName: a.file_name, extractedText: a.extracted_text ?? '' }));
}
