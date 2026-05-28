import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, delay, of, tap, throwError } from 'rxjs';
// import { environment } from '../../../environments/environment.development';
import { environment } from '../../../environments/environment';
import { JwtPayload, LoginRequest, LoginResponse } from '../../features/interfaces/login.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly API = environment.apiUrl;
  private readonly TOKEN_KEY = environment.tokenKey;

  // Inicializa leyendo y validando el token localmente
  private _token = signal<string | null>(this.getValidToken());

  // para @if del HTML
  isAuthenticated = computed(() => !!this._token());
  token = computed(() => this._token());

  payload = computed<JwtPayload | null>(() => {
    const t = this._token();
    return t ? this.decodeToken(t) : null;
  });

  username = computed(() => this.payload()?.user ?? null);
  userId = computed(() => this.payload()?.sub ?? null);

  login(credentials: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.API}/auth/login`, credentials).pipe(
      tap((res) => {
        // Cubre si la API manda token o accessToken
        const tokenToSave = res.token || res.accessToken;
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

    // Verifica si el token tiene fecha de expiración (exp) y si ya pasó
    if (payload && (payload as any).exp) {
      const nowInSeconds = Math.floor(Date.now() / 1000);
      if ((payload as any).exp < nowInSeconds) {
        localStorage.removeItem(this.TOKEN_KEY); // Limpia el token caducado
        return null;
      }
    }

    return token;
  }

  private decodeToken(token: string): JwtPayload | null {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded) as JwtPayload;
    } catch {
      return null;
    }
  }

  register(userData: any) {
    // cuando la api .NET este lista, borras el of() y descomentas la linea de abajo
    // return this.http.post(`${this.API}/auth/register`, userData);

    // simula una peticion que tarda 1.5 segundos
    return of({ success: true }).pipe(delay(1500));
  }
}
