import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLinkActive, RouterLink } from '@angular/router';
import { AuthService } from '../../../../features/services/auth.service';
import { Post, PostCardComponent } from '../../../../shared/components/post-card-component/post-card-component';
@Component({
  selector: 'app-profile-layout',
  imports: [RouterLink, RouterLinkActive, PostCardComponent],
  templateUrl: './profile-layout.html',
  styleUrl: './profile-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileLayout {
  route = inject(ActivatedRoute);
  authService = inject(AuthService);

  // Lee el parámetro :username de la URL
  usernameUrl = signal<string>(this.route.snapshot.paramMap.get('username') || '');

  // Computed: Es true si el usuario logueado está viendo su propio perfil
  isMyProfile = computed(() => {
    const loggedUser = this.authService.username();
    return loggedUser === this.usernameUrl();
  });

  // Método para el Modal (Usa la API nativa de los dialogs de HTML5)
  openEditModal() {
    const modal = document.getElementById('edit_profile_modal') as HTMLDialogElement;
    if (modal) modal.showModal();
  }

  userPosts = signal<Post[]>([
    {
      id: 3,
      userId: 1,
      name: 'Usuario Actual',
      username: this.usernameUrl(),
      content: 'Probando mi nuevo perfil en Orbit. ¡Esto se ve genial!',
      createdAt: new Date(),
      likes: 10,
      comments: 2,
      reposts: 0,
    },
  ]);

  handleDeletePost(postId: number) {
    this.userPosts.update((posts) => posts.filter((p) => p.id !== postId));
  }

  handleLikePost(postId: number) {
    this.userPosts.update((posts) =>
      posts.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p)),
    );
  }
}
