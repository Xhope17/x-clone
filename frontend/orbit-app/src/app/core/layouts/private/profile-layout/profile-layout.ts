import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLinkActive, RouterLink } from '@angular/router';
import { AuthService } from '../../../../shared/services/auth.service';
import { PostCardComponent } from '../../../../shared/components/post-card-component/post-card-component';
import { Post } from '../../../../features/interfaces/post.interface';
import { UserService } from '../../../../features/services/user.service';
import { UserProfile } from '../../../../features/interfaces/user-profile.interface';
import { UpperCasePipe } from '@angular/common';
import { DialogService } from '../../../../shared/services/dialog.service';
import { EditProfileModal } from '../../../../features/pages/private/edit-profile-modal/edit-profile-modal';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-profile-layout',
  imports: [RouterLink, RouterLinkActive, PostCardComponent, UpperCasePipe],
  templateUrl: './profile-layout.html',
  styleUrl: './profile-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileLayout implements OnInit {
  route = inject(ActivatedRoute);
  authService = inject(AuthService);
  userService = inject(UserService);

  currentProfile = signal<UserProfile>(null!);

  usernameUrl = signal<string>(this.route.snapshot.paramMap.get('username') || '');

  private dialogService = inject(DialogService);
  // Computed: Es true si el usuario logueado está viendo su propio perfil
  isMyProfile = computed(() => {
    const loggedUser = this.authService.username();
    return loggedUser === this.usernameUrl();
  });

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.authService.getCurrentUser().subscribe({
      next: (data) => {
        this.currentProfile.set(data.data);
      },
      error: (err) => {
        console.error('Error al obtener el usuario actual', err);
      },
    });
  }

  openEditModal() {
    const saveSubject = new Subject<void>();
    const successSubject = new Subject<boolean>();

    successSubject.subscribe(() => {
      this.loadUserProfile();
    });

    this.dialogService.open({
      title: 'Edit profile',
      component: EditProfileModal,
      // AQUÍ LE PASAMOS LOS DATOS AL INPUT() DEL MODAL
      componentInputs: {
        currentUser: this.currentProfile(),
      },
      btnText: 'Save',
      onSave: saveSubject,
      onSuccess: successSubject,
    });
  }

  userPosts = signal<Post[]>([
    {
      id: 'fc1ddb5c-a4d7-4772-8d68-4cadea7d3412',
      author: {
        profileId: this.authService.payload()?.profile_id || 'mock-profile-id',
        username: this.usernameUrl(),
        displayName: 'Usuario Actual',
        avatarUrl: null,
      },
      content: 'Probando mi nuevo perfil en Orbit. ¡Esto se ve genial!',
      media: [],
      likeCount: 10,
      commentCount: 2,
      isLiked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  // Modificado para recibir string (GUID)
  handleDeletePost(postId: string) {
    this.userPosts.update((posts) => posts.filter((p) => p.id !== postId));
  }

  // Modificado para recibir string (GUID) y actualizar likeCount / isLiked
  handleLikePost(postId: string) {
    this.userPosts.update((posts) =>
      posts.map((p) => {
        if (p.id === postId) {
          // Lógica temporal para alternar el like (dar o quitar like)
          const increment = p.isLiked ? -1 : 1;
          return { ...p, likeCount: p.likeCount + increment, isLiked: !p.isLiked };
        }
        return p;
      }),
    );
  }
}
