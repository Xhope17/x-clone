export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    refreshToken(accessToken: any, refreshToken: any): unknown;
    accessToken: any;
    token: string;
}

export interface JwtPayload {
    sub: number;
    user: string;
    iat: number;
}
