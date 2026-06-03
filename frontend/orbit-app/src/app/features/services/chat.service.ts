import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/interfaces/apiResponse.interface';
import { PaginatedResponse } from '../../shared/interfaces/paginatedResult.interface';
import {
  ChatResponse,
  CreateChatRequest,
  MessageResponse,
  SendMessageRequest,
} from '../interfaces/chat.interface';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly API = environment.apiUrl;

  getConversations() {
    return this.http.get<ApiResponse<ChatResponse[]>>(`${this.API}/chats`);
  }

  createConversation(request: CreateChatRequest) {
    return this.http.post<ApiResponse<ChatResponse>>(`${this.API}/chats`, request);
  }

  getMessages(conversationId: string, page: number = 1, pageSize: number = 50) {
    return this.http.get<ApiResponse<PaginatedResponse<MessageResponse>>>(
      `${this.API}/chats/${conversationId}/messages?page=${page}&pageSize=${pageSize}`,
    );
  }

  sendMessage(conversationId: string, request: SendMessageRequest) {
    return this.http.post<ApiResponse<MessageResponse>>(
      `${this.API}/chats/${conversationId}/messages`,
      request,
    );
  }

  deleteMessage(conversationId: string, messageId: string) {
    return this.http.delete<ApiResponse<null>>(
      `${this.API}/chats/${conversationId}/messages/${messageId}`,
    );
  }
}
