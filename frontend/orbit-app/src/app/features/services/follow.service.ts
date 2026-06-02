import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { ApiResponse } from '../../shared/interfaces/apiResponse.interface';
import { FollowInterface } from '../interfaces/follow.interface';
import { PaginatedResponse } from '../../shared/interfaces/paginatedResult.interface';

@Injectable({
  providedIn: 'root',
})
export class FollowService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  followUser(username: string) {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/profiles/${username}/follow`, {});
  }

  unfollowUser(username: string) {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/profiles/${username}/follow`);
  }

  getFollowers(username: string, page: number = 1, pageSize: number = 20) {
    return this.http.get<ApiResponse<PaginatedResponse<FollowInterface>>>(
      `${this.apiUrl}/profiles/${username}/followers?page=${page}&pageSize=${pageSize}`,
    );
  }

  getFollowing(username: string, page: number = 1, pageSize: number = 20) {
    return this.http.get<ApiResponse<PaginatedResponse<FollowInterface>>>(
      `${this.apiUrl}/profiles/${username}/following?page=${page}&pageSize=${pageSize}`,
    );
  }
}
