import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LikeResponse, Post, PostComment } from '../interfaces/post.interface'; // Ajusta la ruta
import { ApiResponse } from '../../shared/interfaces/apiResponse.interface';
import { PaginatedResponse } from '../../shared/interfaces/paginatedResult.interface';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private http = inject(HttpClient);
  private readonly API = environment.apiUrl;

  getTimeline(page: number = 1, pageSize: number = 20) {
    return this.http.get<ApiResponse<PaginatedResponse<Post>>>(
      `${this.API}/posts/general?page=${page}&pageSize=${pageSize}`,
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

  updatePost(postId: string, formData: FormData) {
    return this.http.put<ApiResponse<Post>>(`${this.API}/posts/${postId}`, formData);
  }

  deletePost(postId: string) {
    return this.http.delete<ApiResponse<any>>(`${this.API}/posts/${postId}`);
  }

  //dar y quitar likes
  toggleLike(postId: string) {
    return this.http.post<ApiResponse<LikeResponse>>(`${this.API}/posts/${postId}/like`, {});
  }
  disLike(postId: string) {
    return this.http.delete<ApiResponse<LikeResponse>>(`${this.API}/posts/${postId}/like`);
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

  searchPosts(query: string, page: number = 1, pageSize: number = 20) {
    let params = new HttpParams()
      .set('q', query)
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<ApiResponse<PaginatedResponse<Post>>>(`${this.API}/posts/search`, {
      params,
    });
  }

  //COMENTARIOS
  likeComment(commentId: string) {
    return this.http.post<ApiResponse<LikeResponse>>(`${this.API}/comments/${commentId}/like`, {});
  }

  disLikeComment(commentId: string) {
    return this.http.delete<ApiResponse<LikeResponse>>(`${this.API}/comments/${commentId}/like`);
  }

  getFollowingTimeline(page: number = 1, pageSize: number = 20) {
    let params = new HttpParams().set('page', page.toString()).set('pageSize', pageSize.toString());

    return this.http.get<ApiResponse<PaginatedResponse<Post>>>(`${this.API}/posts/following`, {
      params,
    });
  }

  repostPost(postId: string) {
    return this.http.post<ApiResponse<Post>>(`${this.API}/posts/${postId}/repost`, {});
  }

  threadPost(postId: string, content: string) {
    return this.http.post<ApiResponse<Post>>(`${this.API}/posts/${postId}/thread`, { content });
  }
}
