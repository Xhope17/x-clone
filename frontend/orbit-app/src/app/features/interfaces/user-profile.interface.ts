export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string;
  followersCount: number;
  followingCount: number;
  isVerified: boolean;
  prefix: string | null;
  isPrivate: boolean; // falta implementar en el backend
}

//esto lo traje directamente del postman
// export interface Data {
//   id: string;
//   username: string;
//   displayName: string;
//   avatarUrl: string;
//   bannerUrl: null;
//   bio: string;
//   followersCount: number;
//   followingCount: number;
//   isVerified: boolean;
//   prefix: null;
// }

export interface UpdateProfileRequest {
  displayName: string;
  bio: string;
  isPrivate: boolean;
}
