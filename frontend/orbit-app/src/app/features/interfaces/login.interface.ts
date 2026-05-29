export interface LoginRequest {
  EmailOrUsername: string;
  password: string;
}

// export interface LoginResponse {
//     refreshToken(accessToken: any, refreshToken: any): unknown;
//     accessToken: any;
//     token: string;
// }

export interface LoginResponse {
  isSuccess: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    profile: any; // Si tienes una interfaz para el perfil, úsala aquí
  };
}

export interface JwtPayload {
  sub: number;
  // user: string;
  unique_name: string; // Cambiado de 'user' a 'unique_name' para coincidir con el token real
  iat: number;
}
