import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarLeftComponent } from '../../../../shared/components/sidebar-left-component/sidebar-left-component';
import { SidebarRightComponent } from '../../../../shared/components/sidebar-right-component/sidebar-right-component';
import { AuthService } from '../../../../features/services/auth.service';
@Component({
  selector: 'app-public-layout',
  // standalone: true, // Agregado standalone por si acaso, ya que usas imports
  imports: [RouterOutlet, SidebarLeftComponent, SidebarRightComponent],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicLayout {
  authService = inject(AuthService);

  handleLogout() {
    this.authService.logout();
  }
}
