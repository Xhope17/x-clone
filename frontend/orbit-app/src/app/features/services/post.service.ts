import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LikeResponse, PaginatedResponse, Post, PostComment } from '../interfaces/post.interface'; // Ajusta la ruta
import { ApiResponse } from '../../shared/interfaces/apiResponse.interface';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private http = inject(HttpClient);
  private readonly API = environment.apiUrl;

  getTimeline(page: number = 1, pageSize: number = 20) {
    return this.http.get<ApiResponse<PaginatedResponse<Post>>>(
      `${this.API}/posts/timeline?page=${page}&pageSize=${pageSize}`,
    );
  }
  createPost(formData: FormData) {
    return this.http.post<ApiResponse<Post>>(`${this.API}/posts`, formData);
  }

  getPostById(postId: string) {
    return this.http.get<ApiResponse<Post>>(`${this.API}/posts/${postId}`);
  }

  getPostsByUsername(username: string, page: number = 1, pageSize: number = 20) {
    return this.http.get<ApiResponse<PaginatedResponse<Post>>>(
      `${this.API}/profiles/${username}/posts?page=${page}&pageSize=${pageSize}`,
    );
  }

  updatePost(postId: string, content: string) {
    return this.http.put<ApiResponse<Post>>(`${this.API}/posts/${postId}`, { content });
  }

  deletePost(postId: string) {
    return this.http.delete<ApiResponse<any>>(`${this.API}/posts/${postId}`);
  }

  //dar y quitar likes
  toggleLike(postId: string) {
    return this.http.post<ApiResponse<LikeResponse>>(`${this.API}/posts/${postId}/like`, {});
  }

  getComments(postId: string, page: number = 1, pageSize: number = 20) {
    return this.http.get<ApiResponse<PaginatedResponse<PostComment>>>(
      `${this.API}/posts/${postId}/comments?page=${page}&pageSize=${pageSize}`,
    );
  }

  createComment(postId: string, content: string) {
    return this.http.post<ApiResponse<PostComment>>(`${this.API}/posts/${postId}/comments`, {
      content,
    });
  }

  deleteComment(commentId: string) {
    return this.http.delete<ApiResponse<any>>(`${this.API}/comments/${commentId}`);
  }
}
