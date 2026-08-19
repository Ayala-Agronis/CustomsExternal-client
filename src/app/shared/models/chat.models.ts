export interface ChatMessage {
  messageId?: string | number;
  conversationId: string | number;
  senderType: 1 | 2 | 3;
  senderUserId: string;
  messageText: string;
  sentDate?: string | Date;
}

export interface ChatConversation {
  conversationId?: string | number;
  externalUserId: string;
  internalUserId?: string | number | null;
  declarationId?: string | number | null;
  status?: number;
  subject?: string;
  createdDate?: Date;
  lastMessageDate?: Date;
  closedDate?: Date;
  lastMessageText?: string;
  lastSenderType?: number;
  isClosed?: boolean;
  canWrite?: boolean;
  isCurrentDeclaration?: boolean;
  isGeneralToday?: boolean;
}

export interface ChatConversationWithMessages {
  conversation: ChatConversation;
  messages: ChatMessage[];
}
