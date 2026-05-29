import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

// Ajusta la ruta si nombraste el archivo de otra manera (ej. auth.interface.ts)
import { JwtPayload, LoginRequest, LoginResponse } from '../../features/interfaces/login.interface';
import { ApiResponse } from '../interfaces/apiResponse.interface';
import { UserProfile } from '../../features/interfaces/user-profile.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly API = environment.apiUrl;
  private readonly TOKEN_KEY = environment.tokenKey;

  private _token = signal<string | null>(this.getValidToken());

  // para @if del HTML
  isAuthenticated = computed(() => !!this._token());
  token = computed(() => this._token());

  payload = computed<JwtPayload | null>(() => {
    const t = this._token();
    return t ? this.decodeToken(t) : null;
  });

  username = computed(() => this.payload()?.unique_name ?? null);
  userId = computed(() => this.payload()?.sub ?? null);

  login(credentials: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.API}/auth/login`, credentials).pipe(
      tap((res) => {
        // Extraemos el token accediendo a la propiedad data del Wrapper
        const tokenToSave = res.data?.accessToken;

        if (tokenToSave) {
          localStorage.setItem(this.TOKEN_KEY, tokenToSave);
          this._token.set(tokenToSave);
        }
      }),
      catchError((err) => {
        console.error('Error en la autenticación', err);
        return throwError(() => err);
      }),
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this._token.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return this._token();
  }

  private getValidToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return null;

    const payload = this.decodeToken(token);

    // Verificamos si el token tiene fecha de expiración (exp) y si ya pasó.
    // Al estar tipado en JwtPayload, ya no necesitamos usar "as any".
    if (payload && payload.exp) {
      const nowInSeconds = Math.floor(Date.now() / 1000);
      if (payload.exp < nowInSeconds) {
        localStorage.removeItem(this.TOKEN_KEY); // Limpia el token caducado
        return null;
      }
    }

    return token;
  }

  private decodeToken(token: string): JwtPayload | null {
    try {
      const payload = token.split('.')[1];
      let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');

      // Clean Code: Agregamos padding para evitar que atob() falle por longitud inválida
      while (base64.length % 4) {
        base64 += '=';
      }

      const decoded = atob(base64);
      return JSON.parse(decoded) as JwtPayload;
    } catch {
      return null;
    }
  }

  register(formData: FormData) {
    // Al enviar un FormData, Angular establece automáticamente Content-Type: multipart/form-data.
    // Usamos el wrapper ApiResponse genérico para capturar el isSuccess y message del backend.
    return this.http.post<ApiResponse<any>>(`${this.API}/auth/register`, formData).pipe(
      catchError((err) => {
        console.error('Error al registrar usuario', err);
        return throwError(() => err);
      }),
    );
  }

  getCurrentUser() {
    return this.http.get<ApiResponse<UserProfile>>(`${this.API}/auth/me`).pipe(
      catchError((err) => {
        console.error('Error al obtener el usuario actual', err);
        return throwError(() => err);
      }),
    );
  }
}
