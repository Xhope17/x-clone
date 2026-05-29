import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../../shared/interfaces/apiResponse.interface';
import { UpdateProfileRequest, UserProfile } from '../interfaces/user-profile.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private readonly API = environment.apiUrl;

  getCurrentUser() {
    return this.http.get(`${this.API}/users/me`);
  }

  getUserByUsername(username: string) {
    return this.http.get(`${this.API}/profiles/${username}`);
  }

  getUserPosts(username: string, page: number = 1, pageSize: number = 20) {
    return this.http.get(
      `${this.API}/profiles/${username}/posts?page=${page}&pageSize=${pageSize}`,
    );
  }

  updateProfile(data: UpdateProfileRequest) {
    return this.http.put<ApiResponse<UserProfile>>(`${this.API}/profile/`, data);
  }

  //{{baseUrl}}/api/profile/avatar
  uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('File', file);
    return this.http.post<ApiResponse<UserProfile>>(`${this.API}/profile/avatar`, formData);
  }

  //{{baseUrl}}/api/profile/banner
  uploadBanner(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<UserProfile>>(`${this.API}/profile/banner`, formData);
  }
}
