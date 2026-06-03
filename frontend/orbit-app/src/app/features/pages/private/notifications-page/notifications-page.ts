import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../../services/notification.service';
import { SignalrService } from '../../../../shared/services/signalr.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { NotificationResponse } from '../../../interfaces/notification.interface';

@Component({
  selector: 'app-notifications-page',
  imports: [DatePipe, RouterLink],
  templateUrl: './notifications-page.html',
  styleUrl: './notifications-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsPage implements OnInit {
  private readonly notificationService = inject(NotificationService);
  private readonly signalrService = inject(SignalrService);

  readonly notifications = signal<NotificationResponse[]>([]);
  readonly loading = signal(false);
  readonly unreadCount = signal(0);

  constructor() {
    effect(() => {
      const notif = this.signalrService.onNotification();
      if (notif) {
        this.notifications.update((list) => {
          const existing = list.find(
            (n) =>
              n.type === notif.type &&
              n.postId === notif.postId &&
              !n.isRead,
          );
          if (existing) {
            return list.map((n) =>
              n.id === existing.id ? notif : n,
            );
          }
          return [notif, ...list];
        });
        this.unreadCount.update((c) => c + 1);
      }
    });
  }

  ngOnInit(): void {
    this.loadNotifications();
    this.loadUnreadCount();
  }

  private loadNotifications(): void {
    this.loading.set(true);
    this.notificationService.getNotifications().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.notifications.set(res.data.items);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private loadUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data !== undefined) {
          this.unreadCount.set(res.data);
        }
      },
    });
  }

  markAsRead(id: string): void {
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        this.notifications.update((list) =>
          list.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );
        this.unreadCount.update((c) => Math.max(0, c - 1));
      },
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.update((list) =>
          list.map((n) => ({ ...n, isRead: true })),
        );
        this.unreadCount.set(0);
      },
    });
  }

  typeIcon(type: string): string {
    switch (type) {
      case 'like':
        return 'fa-regular fa-heart text-red-500';
      case 'comment':
        return 'fa-regular fa-comment text-blue-500';
      case 'repost':
        return 'fa-solid fa-retweet text-green-500';
      case 'thread':
        return 'fa-solid fa-reply-all text-purple-500';
      default:
        return 'fa-regular fa-bell';
    }
  }

  typeLabel(type: string): string {
    switch (type) {
      case 'like':
        return 'le gustó tu post';
      case 'comment':
        return 'comentó tu post';
      case 'repost':
        return 'republicó tu post';
      case 'thread':
        return 'respondió a tu post';
      default:
        return 'interactuó con tu post';
    }
  }
}
