import { ApiResponse } from '../../shared/interfaces/apiResponse.interface';
import { PaginatedResponse } from '../../shared/interfaces/paginatedResult.interface';

export type NotificationType = 'like' | 'comment' | 'repost' | 'thread';

export interface PostAuthorResponse {
  profileId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  isFollowing: boolean;
}

export interface NotificationResponse {
  id: string;
  type: NotificationType;
  actor: PostAuthorResponse;
  postId: string | null;
  postPreview: string | null;
  commentId: string | null;
  commentPreview: string | null;
  totalCount: number;
  isRead: boolean;
  createdAt: string;
}

export type NotificationsResponse = ApiResponse<PaginatedResponse<NotificationResponse>>;
export type UnreadCountResponse = ApiResponse<number>;
