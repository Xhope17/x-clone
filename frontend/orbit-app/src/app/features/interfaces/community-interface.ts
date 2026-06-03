import { Post } from './post.interface';

// principal
export interface CommunityOwner {
  profileId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  memberCount: number;
  isPrivate: boolean;
  bannerUrl: string | null;
  iconUrl: string | null;
  owner?: CommunityOwner;
  isMember?: boolean;
  memberRole?: string | null;
  hasPendingJoinRequest?: boolean;
  hasPendingInvitation?: boolean;
  createdAt?: string;
}

// miembros y roles
export interface CommunityMember {
  profileId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  role: string;
  joinedAt: string;
}

// SOLICITUDES E INVITACIONES
export interface JoinRequest {
  id: string;
  profileId?: string; // Para ver quién lo solicitó
  username?: string;
  displayName?: string;
  avatarUrl?: string | null;
  status: string;
  createdAt: string;
  // Campos extra para "Mis solicitudes" (si aplican en tu backend)
  communityId?: string;
  communityName?: string;
  communitySlug?: string;
}

export interface Invitation {
  id: string;
  communityId: string;
  communityName: string;
  communitySlug: string;
  invitedByProfileId: string;
  invitedByUsername: string;
  status: string;
  createdAt: string;
}

// PAYLOADS (Lo que envías al crear/actualizar)

export interface CreateCommunityPayload {
  name: string;
  description?: string | null;
  isPrivate: boolean;
}

export interface UpdateCommunityPayload {
  name?: string | null;
  description?: string | null;
  isPrivate?: boolean | null;
}

export interface InviteMemberPayload {
  username: string;
}
