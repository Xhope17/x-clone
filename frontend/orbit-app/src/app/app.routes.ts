import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { AuthService } from './shared/services/auth.service';
import { authGuard } from './core/guards/auth.guard';
import { publicGuard } from './core/guards/public.guard';

export const routes: Routes = [
  // === ROOT: redirige según auth ===
  {
    path: '',
    pathMatch: 'full',
    redirectTo: () => {
      const authService = inject(AuthService);
      return authService.isAuthenticated() ? '/home' : '/public';
    },
  },

  // PUBLIC
  {
    path: 'public',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./core/layouts/public/public-layout/public-layout').then((m) => m.PublicLayout),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/pages/public/landing-page/landing-page').then((m) => m.LandingPage),
      },
      {
        path: 'about-us',
        loadComponent: () =>
          import('./features/pages/public/about-us-page/about-us-page').then((m) => m.AboutUsPage),
      },
      {
        path: 'contact-us',
        loadComponent: () =>
          import('./features/pages/public/contact-us-page/contact-us-page').then(
            (m) => m.ContactUsPage,
          ),
      },
    ],
  },

  // AUTH
  {
    path: 'auth',
    loadChildren: () => import('./features/pages/auth/auth.routes'),
  },

  // PRIVATE
  {
    path: '',
    loadComponent: () =>
      import('./core/layouts/private/main-layout/main-layout').then((m) => m.MainLayout),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./features/pages/private/feed-page/feed-page').then((m) => m.FeedPage),
      },
      {
        path: ':username',
        loadComponent: () =>
          import('./features/pages/private/profile/profile-page/profile-page').then(
            (m) => m.ProfilePage,
          ),
      },
      {
        path: 'i/premium',
        loadComponent: () =>
          import('./features/pages/private/premium-page/premium-page').then((m) => m.PremiumPage),
      },
      {
        path: 'i/post/:id',
        loadComponent: () =>
          import('./features/pages/private/post-detail-page/post-detail-page').then(
            (m) => m.PostDetailPage,
          ),
      },
    ],
  },

  {
    path: '**',
    redirectTo: '',
  },
];
