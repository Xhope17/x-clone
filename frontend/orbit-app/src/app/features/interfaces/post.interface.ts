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
  width: number | null;
  height: number | null;
  sizeBytes: number | null;
  format: string | null;
  durationSeconds: number | null;
}

export interface Post {
  id: string;
  author: PostAuthor;
  content?: string; //revisar
  media: Media[];
  likeCount: number;
  commentCount: number;
  saveCount: number;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: string;
  updatedAt: string;
  isRepost: boolean;
  isThread: boolean;
  originalPostId: string | null;
  originalAuthor: PostAuthor | null;
  originalPost: Post | null;
}

export interface PostComment {
  id: string;
  author: PostAuthor;
  content?: string; //revisar
  parentCommentId: string | null;
  replyCount: number;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
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


export interface BookmarkResponse {
  postId: string;
  isSaved: boolean;
}
