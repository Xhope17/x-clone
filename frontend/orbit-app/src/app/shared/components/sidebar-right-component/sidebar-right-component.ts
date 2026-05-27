import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidebar-right',
  imports: [RouterLink],
  templateUrl: './sidebar-right-component.html',
  styleUrl: './sidebar-right-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarRightComponent {
  isAuthenticated = input<boolean>(false);
  username = input<string | null>(null);

  // Emite un evento al padre cuando se hace clic en cerrar sesión
  onLogout = output<void>();
}
