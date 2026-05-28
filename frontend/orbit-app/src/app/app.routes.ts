import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/pages/auth/auth.routes'),
  },

  // ZONA PÚBLICA (Por defecto)
  {
    path: '',
    loadComponent: () =>
      import('./core/layouts/public/public-layout/public-layout').then((m) => m.PublicLayout),
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./features/pages/public/home-page/home-page').then((m) => m.HomePage),
      },
      {
        path: 'i/:username',
        // canActivate: [authGuard],
        loadComponent: () =>
          import('./core/layouts/private/profile-layout/profile-layout').then(
            (m) => m.ProfileLayout,
          ),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },

  // ZONA PRIVADA (Para más adelante)
  {
    path: 'app', // Un prefijo para separar la zona privada (puedes cambiarlo)
    // canActivate: [authGuard],
    loadComponent: () =>
      import('./core/layouts/private/private-layout/private-layout').then((m) => m.PrivateLayout),
    children: [
      // Aquí irán bookmarks, el perfil privado para editar, etc.
    ],
  },

  // REDIRECCIONES GLOBALES
  {
    path: '**',
    redirectTo: 'home',
  },
];
