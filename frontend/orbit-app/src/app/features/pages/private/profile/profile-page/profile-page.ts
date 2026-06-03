import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../../shared/services/auth.service';
import { Post } from '../../../../interfaces/post.interface';
import { UserService } from '../../../../services/user.service';
import { UserProfile } from '../../../../interfaces/user-profile.interface';
import { DialogService } from '../../../../../shared/services/dialog.service';
import { EditProfileModal } from '../components/edit-profile-modal/edit-profile-modal';
import { ProfileHeader } from '../components/profile-header-component/profile-header-component';
import { ProfileTabs } from '../components/profile-tabs-component/profile-tabs-component';
import { UserPostsList } from '../components/user-posts-list-component/user-posts-list-component';
import { Subject } from 'rxjs';
import { FollowService } from '../../../../services/follow.service';

@Component({
  selector: 'app-profile-page',
  imports: [RouterLink, ProfileHeader, ProfileTabs, UserPostsList],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public authService = inject(AuthService);
  private userService = inject(UserService);
  private dialogService = inject(DialogService);
  private followService = inject(FollowService);

  //follows
  public isTogglingFollow = signal<boolean>(false);

  currentProfile = signal<UserProfile | null>(null);

  usernameUrl = signal<string>('');

  isMyProfile = computed(() => {
    const loggedUser = this.authService.username();
    const visitingUser = this.usernameUrl();
    return (
      !!loggedUser && !!visitingUser && loggedUser.toLowerCase() === visitingUser.toLowerCase()
    );
  });

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const username = params.get('username');
      if (username) {
        this.usernameUrl.set(username);
        this.loadUserProfile(username);
      }
    });
  }

  loadUserProfile(username: string) {
    this.userService.getUserByUsername(username).subscribe({
      next: (resp) => {
        if (resp.isSuccess && resp.data) {
          this.currentProfile.set(resp.data);
        }
      },
      error: (err) => {
        console.error('Error al obtener el usuario actual', username, err);
        this.router.navigate(['/home']);
      },
    });
  }

  openEditModal() {
    if (!this.isMyProfile()) return;

    const saveSubject = new Subject<void>();
    const successSubject = new Subject<boolean>();

    successSubject.subscribe(() => {
      this.loadUserProfile(this.usernameUrl());
    });

    this.dialogService.open({
      title: 'Edit profile',
      component: EditProfileModal,
      componentInputs: {
        currentUser: this.currentProfile(),
      },
      btnText: 'Save',
      onSave: saveSubject,
      onSuccess: successSubject,
    });
  }

  handleToggleFollow() {
    const profile = this.currentProfile();
    if (!profile) return;

    this.isTogglingFollow.set(true); // Encendemos el spinner

    if (profile.isFollowing) {
      // Dejar de seguir (DELETE)
      this.followService.unfollowUser(profile.username).subscribe({
        next: () => {
          // Actualizamos la señal: isFollowing = false, y restamos 1 seguidor
          this.currentProfile.update(p => p ? {
            ...p,
            isFollowing: false,
            followersCount: p.followersCount > 0 ? p.followersCount - 1 : 0
          } : null);
          this.isTogglingFollow.set(false);
        },
        error: (err) => {
          console.error('Error al dejar de seguir', err);
          this.isTogglingFollow.set(false);
        }
      });
    } else {
      // Seguir (POST)
      this.followService.followUser(profile.username).subscribe({
        next: () => {
          // Actualizamos la señal: isFollowing = true, y sumamos 1 seguidor
          this.currentProfile.update(p => p ? {
            ...p,
            isFollowing: true,
            followersCount: p.followersCount + 1
          } : null);
          this.isTogglingFollow.set(false);
        },
        error: (err) => {
          console.error('Error al seguir', err);
          this.isTogglingFollow.set(false);
        }
      });
    }
  }
}
