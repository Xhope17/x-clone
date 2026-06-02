export interface PostAuthor {
  profileId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  isFollowing: boolean;
}

export interface Media {
  url: string;
  mediaType: string;
  order: number;
  width: number;
  height: number;
  sizeBytes: number;
  format: string;
  durationSeconds: null | null;
}

export interface Post {
  id: string;
  author: PostAuthor;
  content: string;
  media: Media[]; // Ajusta el tipo si tu backend devuelve objetos en lugar de strings de URLs
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostComment {
  id: string;
  author: PostAuthor;
  content: string;
  parentCommentId: string | null;
  replyCount: number;
  likeCount: number;
  isLiked: boolean;
  createdAt: Date;
}

export interface LikeResponse {
  postId: string;
  isLiked: boolean;
  likeCount: number;
}

export interface PaginatedComments {
  items: PostComment[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
