export type Role = 'user' | 'assistant';

export interface MessageAttachment {
  id: string;
  fileName: string;
}

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  createdAt: string;
  attachments?: MessageAttachment[];
}

export interface ConversationSummary {
  id: string;
  title: string;
  model: string;
  updatedAt: string;
}
