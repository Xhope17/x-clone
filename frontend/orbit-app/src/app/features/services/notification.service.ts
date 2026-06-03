import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/interfaces/apiResponse.interface';
import { PaginatedResponse } from '../../shared/interfaces/paginatedResult.interface';
import { NotificationResponse } from '../interfaces/notification.interface';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly API = environment.apiUrl;

  getNotifications(page: number = 1, pageSize: number = 20) {
    return this.http.get<ApiResponse<PaginatedResponse<NotificationResponse>>>(
      `${this.API}/notifications?page=${page}&pageSize=${pageSize}`,
    );
  }

  getUnreadCount() {
    return this.http.get<ApiResponse<number>>(`${this.API}/notifications/unread-count`);
  }

  markAsRead(id: string) {
    return this.http.patch<ApiResponse<null>>(`${this.API}/notifications/${id}/read`, {});
  }

  markAllAsRead() {
    return this.http.patch<ApiResponse<null>>(`${this.API}/notifications/read-all`, {});
  }
}
