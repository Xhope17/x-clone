export interface SignalRConnectedEvent {
  connected: boolean;
  hub: 'chat' | 'notifications';
}

export interface MessageReadEvent {
  conversationId: string;
  readByProfileId: string;
}

export interface UserTypingEvent {
  conversationId: string;
  profileId: string;
}
