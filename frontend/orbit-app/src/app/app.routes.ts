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
          import('./features/pages/private/feed/feed-page/feed-page').then((m) => m.FeedPage),
      },
      {
        path: 'community',
        loadComponent: () =>
          import('./features/pages/private/community/community-page/community-page').then(
            (m) => m.CommunityPage,
          ),
      },
      {
        path: 'c/:slug',
        loadComponent: () =>
          import('./features/pages/private/community/community-detail-page/community-detail-page').then(
            (m) => m.CommunityDetailPage,
          ),
      },
      {
        path: 'bookmarks',
        loadComponent: () =>
          import('./features/pages/private/bookmarks-page/bookmarks-page').then(
            (m) => m.BookmarksPage,
          ),
      },
      {
        path: 'search',
        loadComponent: () =>
          import('./features/pages/private/search/search-page/search-page').then(
            (m) => m.SearchPage,
          ),
      },
      {
        path: 'i/premium',
        loadComponent: () =>
          import('./features/pages/private/premium-page/premium-page').then((m) => m.PremiumPage),
      },
      {
        path: 'i/chat',
        loadComponent: () =>
          import('./features/pages/private/chat/chat-page/chat-page').then((m) => m.ChatPage),
      },
      {
        path: 'i/post/:id',
        loadComponent: () =>
          import('./features/pages/private/post-detail-page/post-detail-page').then(
            (m) => m.PostDetailPage,
          ),
      },
      {
        path: ':username',
        loadComponent: () =>
          import('./features/pages/private/profile/profile-page/profile-page').then(
            (m) => m.ProfilePage,
          ),
      },
      {
        path: ':username/followers',
        data: { listType: 'followers' }, // Le decimos que es la lista de seguidores
        loadComponent: () =>
          import('./features/pages/private/follow/follow-list-page/follow-list-page').then(
            (m) => m.FollowListPage,
          ),
      },
      {
        path: ':username/following',
        data: { listType: 'following' }, // Le decimos que es la lista de seguidos
        loadComponent: () =>
          import('./features/pages/private/follow/follow-list-page/follow-list-page').then(
            (m) => m.FollowListPage,
          ),
      },
    ],
  },

  {
    path: '**',
    redirectTo: '',
  },
];
