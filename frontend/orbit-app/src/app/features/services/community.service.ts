import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/interfaces/apiResponse.interface';
import { PaginatedResponse } from '../../shared/interfaces/paginatedResult.interface';
import {
  CreateCommunityPayload,
  Community,
  UpdateCommunityPayload,
  CommunityMember,
  JoinRequest,
  InviteMemberPayload,
  Invitation,
} from '../interfaces/community-interface';
import { Post } from '../interfaces/post.interface';

@Injectable({
  providedIn: 'root',
})
export class CommunityService {
  private http = inject(HttpClient);
  private readonly API = environment.apiUrl;

  // GESTIÓN BÁSICA DE COMUNIDADES

  createCommunity(payload: CreateCommunityPayload) {
    return this.http.post<ApiResponse<Community>>(`${this.API}/communities`, payload);
  }

  getCommunity(slug: string) {
    return this.http.get<ApiResponse<Community>>(`${this.API}/communities/${slug}`);
  }

  updateCommunity(slug: string, payload: UpdateCommunityPayload) {
    return this.http.put<ApiResponse<Community>>(`${this.API}/communities/${slug}`, payload);
  }

  deleteCommunity(slug: string) {
    return this.http.delete<ApiResponse<any>>(`${this.API}/communities/${slug}`);
  }

  searchCommunities(query: string, page: number = 1, pageSize: number = 20) {
    let params = new HttpParams()
      .set('q', query)
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<ApiResponse<PaginatedResponse<Community>>>(`${this.API}/communities`, {
      params,
    });
  }

  getMyCommunities(page: number = 1, pageSize: number = 20) {
    let params = new HttpParams().set('page', page.toString()).set('pageSize', pageSize.toString());
    return this.http.get<ApiResponse<PaginatedResponse<Community>>>(`${this.API}/communities/my`, {
      params,
    });
  }

  // MIEMBROS Y ROLES

  joinCommunity(slug: string) {
    return this.http.post<ApiResponse<any>>(`${this.API}/communities/${slug}/join`, {});
  }

  leaveCommunity(slug: string) {
    return this.http.delete<ApiResponse<any>>(`${this.API}/communities/${slug}/leave`);
  }

  getMembers(slug: string, page: number = 1, pageSize: number = 20) {
    let params = new HttpParams().set('page', page.toString()).set('pageSize', pageSize.toString());
    return this.http.get<ApiResponse<PaginatedResponse<CommunityMember>>>(
      `${this.API}/communities/${slug}/members`,
      { params },
    );
  }

  kickMember(slug: string, profileId: string) {
    return this.http.delete<ApiResponse<any>>(
      `${this.API}/communities/${slug}/members/${profileId}`,
    );
  }

  assignCoLeader(slug: string, targetUsername: string) {
    return this.http.post<ApiResponse<any>>(
      `${this.API}/communities/${slug}/co-leaders/${targetUsername}`,
      {},
    );
  }

  removeCoLeader(slug: string, targetUsername: string) {
    return this.http.delete<ApiResponse<any>>(
      `${this.API}/communities/${slug}/co-leaders/${targetUsername}`,
    );
  }

  // SOLICITUDES DE UNIÓN (Para comunidades privadas)

  requestToJoin(slug: string) {
    return this.http.post<ApiResponse<JoinRequest>>(
      `${this.API}/communities/${slug}/join-request`,
      {},
    );
  }

  getPendingRequests(slug: string, page: number = 1, pageSize: number = 20) {
    let params = new HttpParams().set('page', page.toString()).set('pageSize', pageSize.toString());
    return this.http.get<ApiResponse<PaginatedResponse<JoinRequest>>>(
      `${this.API}/communities/${slug}/join-requests`,
      { params },
    );
  }

  getMyJoinRequests(page: number = 1, pageSize: number = 20) {
    let params = new HttpParams().set('page', page.toString()).set('pageSize', pageSize.toString());
    return this.http.get<ApiResponse<PaginatedResponse<JoinRequest>>>(
      `${this.API}/communities/join-requests/my`,
      { params },
    );
  }

  approveRequest(requestId: string) {
    return this.http.post<ApiResponse<any>>(
      `${this.API}/communities/join-requests/${requestId}/approve`,
      {},
    );
  }

  rejectRequest(requestId: string) {
    return this.http.post<ApiResponse<any>>(
      `${this.API}/communities/join-requests/${requestId}/reject`,
      {},
    );
  }

  // TODO: Agregar endpoint para cancelar solicitud en el backend

  // INVITACIONES

  inviteMember(slug: string, payload: InviteMemberPayload) {
    return this.http.post<ApiResponse<any>>(`${this.API}/communities/${slug}/invitations`, payload);
  }

  getPendingInvitations(slug: string, page: number = 1, pageSize: number = 20) {
    let params = new HttpParams().set('page', page.toString()).set('pageSize', pageSize.toString());
    return this.http.get<ApiResponse<PaginatedResponse<Invitation>>>(
      `${this.API}/communities/${slug}/invitations`,
      { params },
    );
  }

  getMyInvitations(page: number = 1, pageSize: number = 20) {
    let params = new HttpParams().set('page', page.toString()).set('pageSize', pageSize.toString());
    return this.http.get<ApiResponse<PaginatedResponse<Invitation>>>(
      `${this.API}/communities/invitations/pending`,
      { params },
    );
  }

  acceptInvitation(invitationId: string) {
    return this.http.post<ApiResponse<any>>(
      `${this.API}/communities/invitations/${invitationId}/accept`,
      {},
    );
  }

  declineInvitation(invitationId: string) {
    return this.http.post<ApiResponse<any>>(
      `${this.API}/communities/invitations/${invitationId}/decline`,
      {},
    );
  }

  // POSTS DE LA COMUNIDAD

  createCommunityPost(slug: string, formData: FormData) {
    return this.http.post<ApiResponse<Post>>(`${this.API}/communities/${slug}/posts`, formData);
  }

  getCommunityPosts(slug: string, page: number = 1, pageSize: number = 20) {
    let params = new HttpParams().set('page', page.toString()).set('pageSize', pageSize.toString());
    return this.http.get<ApiResponse<PaginatedResponse<Post>>>(
      `${this.API}/communities/${slug}/posts`,
      { params },
    );
  }
}
