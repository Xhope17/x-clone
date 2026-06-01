import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { UserProfile } from '../../../../../interfaces/user-profile.interface';

@Component({
  selector: 'app-profile-header',
  imports: [],
  templateUrl: './profile-header-component.html',
  styleUrl: './profile-header-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileHeader {
  currentProfile = input<UserProfile | null>(null);
  usernameUrl = input<string>('');
  isMyProfile = input<boolean>(false);
  editProfile = output<void>();
}
