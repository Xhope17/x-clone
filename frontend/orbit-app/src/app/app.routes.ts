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
        path: 'premium',
        // canActivate: [authGuard], // Opcional, si quieres que solo logueados lo vean
        loadComponent: () =>
          import('./features/pages/private/premium-page/premium-page').then((m) => m.PremiumPage),
      },
      // Dentro de tus rutas...
      {
        path: 'post/:id', // La ruta será tusitio.com/post/11eb80cc-...
        loadComponent: () =>
          import('./features/pages/private/post-detail-page/post-detail-page').then(
            (m) => m.PostDetailPage,
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
  // {
  //   path: 'app', // Un prefijo para separar la zona privada (puedes cambiarlo)
  //   // canActivate: [authGuard],
  //   loadComponent: () =>
  //     import('./core/layouts/private/private-layout/private-layout').then((m) => m.PrivateLayout),
  //   children: [

  //   ],

  // },

  // REDIRECCIONES GLOBALES
  {
    path: '**',
    redirectTo: 'home',
  },
];
