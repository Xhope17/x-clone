export interface ChatProfileInfo {
  profileId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface ChatMessageBroadcast {
  id: string;
  conversationId: string;
  content: string | null;
  isSeen: boolean;
  isEdited: boolean;
  editedAt: string | null;
  createdAt: string;
  deletedAt: string | null;
  sender: ChatProfileInfo;
}

export interface MessageResponse {
  id: string;
  conversationId: string;
  senderProfileId: string;
  content: string | null;
  isSeen: boolean;
  isEdited: boolean;
  editedAt: string | null;
  createdAt: string;
  deletedAt: string | null;
  isFromCurrentUser: boolean;
}

export interface ChatResponse {
  id: string;
  otherParticipant: ChatProfileInfo;
  lastMessage: MessageResponse | null;
  unreadCount: number;
  createdAt: string;
  isLastMessageFromCurrentUser: boolean;
}

export interface CreateChatRequest {
  username: string;
}

export interface SendMessageRequest {
  content: string;
}
