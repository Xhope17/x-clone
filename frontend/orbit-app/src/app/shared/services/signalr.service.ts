import { Injectable, signal } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import {
  ChatMessageBroadcast,
  ChatResponse,
} from '../../features/interfaces/chat.interface';
import { NotificationResponse } from '../../features/interfaces/notification.interface';

@Injectable({
  providedIn: 'root',
})
export class SignalrService {
  private chatHub: HubConnection | null = null;
  private notificationHub: HubConnection | null = null;

  readonly chatConnected = signal(false);
  readonly notificationConnected = signal(false);

  readonly onReceiveMessage = signal<ChatMessageBroadcast | null>(null);
  readonly onReceiveOwnMessage = signal<ChatMessageBroadcast | null>(null);
  readonly onNewConversation = signal<ChatResponse | null>(null);
  readonly onMessageRead = signal<{
    conversationId: string;
    readByProfileId: string;
  } | null>(null);
  readonly onUserTyping = signal<{
    conversationId: string;
    profileId: string;
  } | null>(null);
  readonly onNotification = signal<NotificationResponse | null>(null);

  async startConnections(token: string): Promise<void> {
    if (!token) return;

    await Promise.all([
      this.startChatHub(token),
      this.startNotificationHub(token),
    ]);
  }

  async stopConnections(): Promise<void> {
    this.chatHub?.off('ReceiveMessage');
    this.chatHub?.off('ReceiveOwnMessage');
    this.chatHub?.off('NewConversation');
    this.chatHub?.off('MessageRead');
    this.chatHub?.off('UserTyping');
    this.notificationHub?.off('ReceiveNotification');

    await Promise.all([
      this.stopHub(this.chatHub, this.chatConnected),
      this.stopHub(this.notificationHub, this.notificationConnected),
    ]);

    this.chatHub = null;
    this.notificationHub = null;
  }

  async restartConnections(token: string): Promise<void> {
    await this.stopConnections();
    await this.startConnections(token);
  }

  async joinConversation(conversationId: string): Promise<void> {
    if (this.chatHub?.state === HubConnectionState.Connected) {
      await this.chatHub.invoke('JoinConversation', conversationId);
    }
  }

  async leaveConversation(conversationId: string): Promise<void> {
    if (this.chatHub?.state === HubConnectionState.Connected) {
      await this.chatHub.invoke('LeaveConversation', conversationId);
    }
  }

  async sendMessage(conversationId: string, content: string): Promise<void> {
    if (this.chatHub?.state === HubConnectionState.Connected) {
      await this.chatHub.invoke('SendMessage', conversationId, content);
    }
  }

  async markAsRead(conversationId: string): Promise<void> {
    if (this.chatHub?.state === HubConnectionState.Connected) {
      await this.chatHub.invoke('MarkAsRead', conversationId);
    }
  }

  async typing(conversationId: string): Promise<void> {
    if (this.chatHub?.state === HubConnectionState.Connected) {
      await this.chatHub.send('Typing', conversationId);
    }
  }

  private getToken(): string | null {
    return localStorage.getItem(environment.tokenKey);
  }

  private async startChatHub(token: string): Promise<void> {
    if (this.chatHub?.state === HubConnectionState.Connected) return;

    this.chatHub = new HubConnectionBuilder()
      .withUrl(`${environment.signalRUrl}/hubs/chat`, {
        accessTokenFactory: () => this.getToken() ?? '',
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    this.chatHub.on('ReceiveMessage', (data: ChatMessageBroadcast) => {
      this.onReceiveMessage.set(data);
    });

    this.chatHub.on('ReceiveOwnMessage', (data: ChatMessageBroadcast) => {
      this.onReceiveOwnMessage.set(data);
    });

    this.chatHub.on('NewConversation', (data: ChatResponse) => {
      this.onNewConversation.set(data);
    });

    this.chatHub.on(
      'MessageRead',
      (data: { conversationId: string; readByProfileId: string }) => {
        this.onMessageRead.set(data);
      },
    );

    this.chatHub.on(
      'UserTyping',
      (data: { conversationId: string; profileId: string }) => {
        this.onUserTyping.set(data);
      },
    );

    this.chatHub.onreconnecting(() => this.chatConnected.set(false));
    this.chatHub.onreconnected(() => this.chatConnected.set(true));
    this.chatHub.onclose(() => this.chatConnected.set(false));

    try {
      await this.chatHub.start();
      this.chatConnected.set(true);
    } catch {
      this.chatConnected.set(false);
    }
  }

  private async startNotificationHub(token: string): Promise<void> {
    if (this.notificationHub?.state === HubConnectionState.Connected) return;

    this.notificationHub = new HubConnectionBuilder()
      .withUrl(`${environment.signalRUrl}/hubs/notifications`, {
        accessTokenFactory: () => this.getToken() ?? '',
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    this.notificationHub.on(
      'ReceiveNotification',
      (data: NotificationResponse) => {
        this.onNotification.set(data);
      },
    );

    this.notificationHub.onreconnecting(() => this.notificationConnected.set(false));
    this.notificationHub.onreconnected(() => this.notificationConnected.set(true));
    this.notificationHub.onclose(() => this.notificationConnected.set(false));

    try {
      await this.notificationHub.start();
      this.notificationConnected.set(true);
    } catch {
      this.notificationConnected.set(false);
    }
  }

  private async stopHub(
    hub: HubConnection | null,
    connectedSignal: ReturnType<typeof signal>,
  ): Promise<void> {
    if (hub && hub.state !== HubConnectionState.Disconnected) {
      try {
        await hub.stop();
      } catch {
        /* ignore */
      }
    }
    connectedSignal.set(false);
  }
}
