import type { ChatMessage } from './types';

export interface MockConversation {
  id: string;
  title: string;
  model: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export const mockConversations: MockConversation[] = [
  {
    id: 'c1',
    title: 'Binary search tree traversal',
    model: 'claude-sonnet-5',
    updatedAt: '2026-10-27T09:12:00Z',
    messages: [
      {
        id: 'm1',
        role: 'user',
        content: 'Can you explain in-order traversal of a BST and why it returns sorted output?',
        createdAt: '2026-10-27T09:10:00Z',
      },
      {
        id: 'm2',
        role: 'assistant',
        content:
          'In-order traversal visits the left subtree, then the node, then the right subtree. Because a BST keeps every left descendant smaller and every right descendant larger than the node, visiting in that order naturally walks the values from smallest to largest.',
        createdAt: '2026-10-27T09:10:20Z',
      },
      {
        id: 'm3',
        role: 'user',
        content: 'Got it. What about post-order traversal — when is that actually useful?',
        createdAt: '2026-10-27T09:12:00Z',
      },
    ],
  },
  {
    id: 'c2',
    title: 'Zatroz proposal follow-up',
    model: 'claude-opus-5-5',
    updatedAt: '2026-10-26T15:40:00Z',
    messages: [
      {
        id: 'm4',
        role: 'user',
        content: 'Draft a short, polite follow-up email to a client who hasn\u2019t replied in a week.',
        createdAt: '2026-10-26T15:38:00Z',
      },
      {
        id: 'm5',
        role: 'assistant',
        content:
          'Here\u2019s a short draft:\n\nSubject: Checking in\n\nHi [Name], just following up on the proposal I sent over last week \u2014 happy to answer any questions or adjust scope if that would help. Let me know what works.',
        createdAt: '2026-10-26T15:39:00Z',
      },
    ],
  },
  {
    id: 'c3',
    title: 'New conversation',
    model: 'claude-sonnet-5',
    updatedAt: '2026-10-28T08:00:00Z',
    messages: [],
  },
];

export function getConversation(id: string): MockConversation | null {
  return mockConversations.find((c) => c.id === id) ?? null;
}

export const models = [
  { id: 'claude-haiku-5-5', label: 'Haiku — fast & cheap' },
  { id: 'claude-sonnet-5', label: 'Sonnet — default' },
  { id: 'claude-opus-5-5', label: 'Opus — deep reasoning' },
];
