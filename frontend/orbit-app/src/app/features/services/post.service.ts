import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Post } from '../interfaces/post.interface'; // Ajusta la ruta
import { ApiResponse, PaginatedResult } from '../../shared/interfaces/apiResponse.interface';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private http = inject(HttpClient);
  private readonly API = environment.apiUrl;

  // Trae el feed paginado
  getTimeline(page: number = 1, pageSize: number = 20) {
    return this.http.get<ApiResponse<PaginatedResult<Post>>>(
      `${this.API}/posts/timeline?page=${page}&pageSize=${pageSize}`,
    );
  }

  deletePost(id: string) {
    return this.http.delete<ApiResponse<any>>(`${this.API}/posts/${id}`);
  }

  likePost(id: string) {
    // Post requiere un body, mandamos un objeto vacío
    return this.http.post<ApiResponse<any>>(`${this.API}/posts/${id}/like`, {});
  }

  unlikePost(id: string) {
    return this.http.delete<ApiResponse<any>>(`${this.API}/posts/${id}/like`);
  }

  createPost(formData: FormData) {
    return this.http.post<ApiResponse<Post>>(`${this.API}/posts`, formData);
  }
}
