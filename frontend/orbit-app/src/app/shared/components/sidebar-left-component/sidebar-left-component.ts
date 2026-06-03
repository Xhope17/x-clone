import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UpperCasePipe } from '@angular/common';

// Asegúrate de que las rutas a tus servicios sean correctas
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../../features/services/user.service';
import { UserProfile } from '../../../features/interfaces/user-profile.interface';

@Component({
  selector: 'app-sidebar-left',
  standalone: true, // Si usas standalone
  imports: [RouterLink, RouterLinkActive, UpperCasePipe],
  templateUrl: './sidebar-left-component.html',
  styleUrl: './sidebar-left-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarLeftComponent implements OnInit {
  public authService = inject(AuthService);
  public userService = inject(UserService);

  public userProfile = signal<UserProfile | null>(null);

  public isAuthenticated = this.authService.isAuthenticated;
  public username = this.authService.username;

  public publicMenu = [
    { icon: 'fa-regular fa-house', label: 'Inicio', route: '/home' },
    { icon: 'fa-solid fa-magnifying-glass', label: 'Explorar', route: '/search' },
  ];

  public privateMenu = computed(() => [
    { icon: 'fa-regular fa-bookmark', label: 'Guardados', route: '/bookmarks' },
    // { icon: 'fa-regular fa-follow', label: 'Siguiendo', route: `/${this.username()}/following` },
    // {
    //   icon: 'fa-solid fa-users', label: 'Comunidades (falta)', route: `/${this.username()}/community`,
    // },
        { icon: 'fa-regular fa-comment', label: 'Chat (falta)', route: '/i/chat' },

    {
      icon: 'fa-solid fa-users',
      label: 'Comunidades',
      route: `/community`,
    },
    // { icon: 'fa-solid fa-user-group', label: 'Seguidores', route: `/${this.username()}/followers` },
    {
      icon: 'fa-regular fa-address-book',
      label: 'Seguidores',
      route: `/${this.username()}/followers`,
    },
    { icon: 'fa-regular fa-gem', label: 'Premium (falta)', route: '/i/premium' },

    { icon: 'fa-regular fa-user', label: 'Perfil', route: `/${this.username()}` },
  ]);

  ngOnInit() {
    if (this.isAuthenticated()) {
      this.authService.getCurrentUser().subscribe({
        next: (res) => {
          if (res.isSuccess && res.data) {
            this.userProfile.set(res.data);
          }
        },
        error: (err) => console.error('Error al cargar perfil', err),
      });
    }
  }

  handleLogout() {
    this.authService.logout();
  }
}
