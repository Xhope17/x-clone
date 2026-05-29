import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../shared/services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          // Token expirado o inválido -> Lo deslogueamos automáticamente
          console.warn('Sesión expirada o no autorizada.');
          auth.logout();
          break;
        case 403:
          // No tiene permisos para esta acción específica
          router.navigate(['/home']);
          break;
        case 404:
          console.error('Recurso no encontrado:', req.url);
          break;
        case 500:
          console.error('Error interno del servidor en .NET');
          break;
      }
      return throwError(() => error);
    })
  );
};
