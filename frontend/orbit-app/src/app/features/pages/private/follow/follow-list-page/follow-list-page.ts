import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../../../shared/services/auth.service';
import { FollowInterface } from '../../../../interfaces/follow.interface';
import { FollowService } from '../../../../services/follow.service';
import { Location, UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-follow-list-page',
  imports: [RouterLink, UpperCasePipe],
  templateUrl: './follow-list-page.html',
  styleUrl: './follow-list-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FollowListPage implements OnInit {
  private route = inject(ActivatedRoute);
  private followService = inject(FollowService);
  private location = inject(Location);
  public authService = inject(AuthService);

  // para la UI
  public usernameUrl = signal<string>('');
  public usersList = signal<FollowInterface[]>([]);
  public isLoading = signal<boolean>(true);

  //id del usuario que se esta viendo en la url
  public loadingFollowIds = signal<Set<string>>(new Set());

  //detecta modo de lista
  public listType = signal<'followers' | 'following'>('followers');

  ngOnInit() {
    //revisa la ruta para saber si es followers o following
    this.route.data.subscribe((data) => {
      if (data['listType']) {
        this.listType.set(data['listType']);
      }
    });

    this.route.paramMap.subscribe((params) => {
      const username = params.get('username');
      if (username) {
        this.usernameUrl.set(username);
        this.loadFollowers(username);
      }
    });
  }

  loadFollowers(username: string) {
    this.isLoading.set(true);

    const request = this.listType() === 'followers'
      ? this.followService.getFollowers(username)
      : this.followService.getFollowing(username);

    request.subscribe({
      next: (resp) => {
        if (resp.isSuccess && resp.data) {
          this.usersList.set(resp.data.items);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando la lista', err);
        this.isLoading.set(false);
      },
    });
  }

  toggleFollow(event: Event, targetUser: FollowInterface) {
    event.stopPropagation();
    event.preventDefault();

    if (this.loadingFollowIds().has(targetUser.profileId)) return;

    this.setLoadingState(targetUser.profileId, true);

    if (targetUser.isFollowing) {
      this.followService.unfollowUser(targetUser.username).subscribe({
        next: () => this.updateUserFollowState(targetUser.profileId, false),
        error: () => this.setLoadingState(targetUser.profileId, false),
      });
    } else {
      this.followService.followUser(targetUser.username).subscribe({
        next: () => this.updateUserFollowState(targetUser.profileId, true),
        error: () => this.setLoadingState(targetUser.profileId, false),
      });
    }
  }

  private setLoadingState(profileId: string, isLoading: boolean) {
    this.loadingFollowIds.update((set) => {
      const newSet = new Set(set);
      isLoading ? newSet.add(profileId) : newSet.delete(profileId);
      return newSet;
    });
  }

  private updateUserFollowState(profileId: string, isFollowing: boolean) {
    this.usersList.update((users) =>
      users.map((u) => (u.profileId === profileId ? { ...u, isFollowing } : u)),
    );
    this.setLoadingState(profileId, false);
  }

  goBack() {
    this.location.back();
  }
}
