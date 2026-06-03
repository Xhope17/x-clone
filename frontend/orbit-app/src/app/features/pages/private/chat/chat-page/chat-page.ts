import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { ChatService } from '../../../../services/chat.service';
import { SignalrService } from '../../../../../shared/services/signalr.service';
import { AuthService } from '../../../../../shared/services/auth.service';
import {
  ChatMessageBroadcast,
  ChatProfileInfo,
  ChatResponse,
  MessageResponse,
} from '../../../../interfaces/chat.interface';
import { DialogService } from '../../../../../shared/services/dialog.service';

@Component({
  selector: 'app-chat-page',
  imports: [FormsModule, DatePipe, UpperCasePipe],
  templateUrl: './chat-page.html',
  styleUrl: './chat-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatPage implements OnInit {
  private readonly chatService = inject(ChatService);
  private readonly signalrService = inject(SignalrService);
  private readonly authService = inject(AuthService);
  private readonly dialogService = inject(DialogService);
  private readonly destroyRef = inject(DestroyRef);

  readonly conversations = signal<ChatResponse[]>([]);
  readonly messages = signal<MessageResponse[]>([]);
  readonly activeConversation = signal<ChatResponse | null>(null);
  readonly loadingConversations = signal(false);
  readonly loadingMessages = signal(false);
  readonly messageInput = signal('');
  readonly showMobileList = signal(true);
  readonly typingProfile = signal<ChatProfileInfo | null>(null);
  readonly newMessageUsername = signal('');
  readonly currentProfileId = computed(() => this.authService.payload()?.profile_id ?? null);

  private typingTimeout: ReturnType<typeof setTimeout> | null = null;
  private joinedConversationId: string | null = null;

  constructor() {
    effect(() => {
      const msg = this.signalrService.onReceiveMessage();
      if (msg && msg.conversationId === this.joinedConversationId) {
        this.messages.update((list) => [...list, this.toMessageResponse(msg)]);
        this.updateConversationLastMessage(msg);
        this.signalrService.markAsRead(msg.conversationId);
      }
    });

    effect(() => {
      const msg = this.signalrService.onReceiveOwnMessage();
      if (msg && msg.conversationId === this.joinedConversationId) {
        this.messages.update((list) => [...list, this.toMessageResponse(msg)]);
        this.updateConversationLastMessage(msg);
      }
    });

    effect(() => {
      const conv = this.signalrService.onNewConversation();
      if (conv) {
        this.conversations.update((list) => {
          const exists = list.find((c) => c.id === conv.id);
          return exists ? list : [conv, ...list];
        });
      }
    });

    effect(() => {
      const event = this.signalrService.onMessageRead();
      if (event) {
        this.messages.update((list) =>
          list.map((m) =>
            m.senderProfileId !== this.currentProfileId()
              ? { ...m, isSeen: true }
              : m,
          ),
        );
        this.conversations.update((list) =>
          list.map((c) =>
            c.id === event.conversationId ? { ...c, unreadCount: 0 } : c,
          ),
        );
      }
    });

    effect(() => {
      const event = this.signalrService.onUserTyping();
      if (event && event.conversationId === this.joinedConversationId) {
        const conv = this.conversations().find(
          (c) => c.id === event.conversationId,
        );
        if (conv && conv.otherParticipant.profileId === event.profileId) {
          this.typingProfile.set(conv.otherParticipant);
        }
        setTimeout(() => this.typingProfile.set(null), 3000);
      }
    });

    this.destroyRef.onDestroy(() => {
      if (this.joinedConversationId) {
        this.signalrService.leaveConversation(this.joinedConversationId);
      }
    });
  }

  ngOnInit(): void {
    this.loadConversations();
  }

  private updateConversationLastMessage(msg: ChatMessageBroadcast): void {
    this.conversations.update((list) =>
      list.map((c) =>
        c.id === msg.conversationId
          ? {
              ...c,
              lastMessage: {
                id: msg.id,
                conversationId: msg.conversationId,
                senderProfileId: msg.sender.profileId,
                content: msg.content,
                isSeen: msg.isSeen,
                isEdited: msg.isEdited,
                editedAt: msg.editedAt,
                createdAt: msg.createdAt,
                deletedAt: msg.deletedAt,
                isFromCurrentUser: msg.sender.profileId === this.currentProfileId(),
              },
              isLastMessageFromCurrentUser:
                msg.sender.profileId === this.currentProfileId(),
            }
          : c,
      ),
    );
  }

  private loadConversations(): void {
    this.loadingConversations.set(true);
    this.chatService.getConversations().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.conversations.set(res.data);
        }
        this.loadingConversations.set(false);
      },
      error: () => this.loadingConversations.set(false),
    });
  }

  selectConversation(conversation: ChatResponse): void {
    if (this.joinedConversationId) {
      this.signalrService.leaveConversation(this.joinedConversationId);
    }

    this.activeConversation.set(conversation);
    this.showMobileList.set(false);
    this.joinedConversationId = conversation.id;
    this.signalrService.joinConversation(conversation.id);
    this.signalrService.markAsRead(conversation.id);
    this.loadMessages(conversation.id);
  }

  private loadMessages(conversationId: string): void {
    this.loadingMessages.set(true);
    this.chatService.getMessages(conversationId).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.messages.set(res.data.items);
        }
        this.loadingMessages.set(false);
      },
      error: () => this.loadingMessages.set(false),
    });
  }

  sendMessage(): void {
    const content = this.messageInput().trim();
    if (!content || !this.activeConversation()) return;

    const conversationId = this.activeConversation()!.id;
    this.signalrService.sendMessage(conversationId, content);
    this.messageInput.set('');
  }

  onTyping(): void {
    if (!this.activeConversation()) return;

    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    this.signalrService.typing(this.activeConversation()!.id);

    this.typingTimeout = setTimeout(() => {
      this.typingTimeout = null;
    }, 2000);
  }

  goBackToList(): void {
    if (this.joinedConversationId) {
      this.signalrService.leaveConversation(this.joinedConversationId);
      this.joinedConversationId = null;
    }
    this.activeConversation.set(null);
    this.messages.set([]);
    this.showMobileList.set(true);
  }

  createNewConversation(): void {
    const username = this.newMessageUsername().trim();
    if (!username) return;

    this.chatService.createConversation({ username }).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.conversations.update((list) => {
            const exists = list.find((c) => c.id === res.data!.id);
            return exists ? list : [res.data!, ...list];
          });
          this.selectConversation(res.data);
          this.newMessageUsername.set('');
        }
      },
      error: () => {
        this.dialogService.open({
          title: 'Error',
          message:
            'No se pudo crear la conversación. Verifica que el usuario exista y os sigáis mutuamente.',
        });
      },
    });
  }

  isOwnMessage(message: MessageResponse): boolean {
    return message.senderProfileId === this.currentProfileId();
  }

  private toMessageResponse(msg: ChatMessageBroadcast): MessageResponse {
    return {
      id: msg.id,
      conversationId: msg.conversationId,
      senderProfileId: msg.sender.profileId,
      content: msg.content,
      isSeen: msg.isSeen,
      isEdited: msg.isEdited,
      editedAt: msg.editedAt,
      createdAt: msg.createdAt,
      deletedAt: msg.deletedAt,
      isFromCurrentUser: msg.sender.profileId === this.currentProfileId(),
    };
  }

  trackByConversationId(index: number, item: ChatResponse): string {
    return item.id;
  }

  trackByMessageId(index: number, item: MessageResponse): string {
    return item.id;
  }
}
