import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../features/services/auth.service';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-sidebar-left',
  // standalone: true,
  imports: [RouterLink, RouterLinkActive, UpperCasePipe],
  templateUrl: './sidebar-left-component.html',
  styleUrl: './sidebar-left-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarLeftComponent {
  isAuthenticated = input<boolean>(false);
  username = input<string | null>(null);

  onLogout = output<void>();

  publicMenu = [
    { icon: 'fa-regular fa-house', label: 'Inicio', route: '/home' },
    { icon: 'fa-solid fa-magnifying-glass', label: 'Explorar', route: '/explore' },
  ];

  privateMenu = computed(() => [
    { icon: 'fa-regular fa-bookmark', label: 'Guardados', route: '/bookmarks' },
    { icon: 'fa-regular fa-gem', label: 'Premium', route: '/premium' },
    { icon: 'fa-regular fa-user', label: 'Perfil', route: `/i/${this.username()}` },
  ]);
}
