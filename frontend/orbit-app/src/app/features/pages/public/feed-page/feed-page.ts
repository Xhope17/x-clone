import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../../shared/services/auth.service';
import { PostCardComponent } from '../../../../shared/components/post-card-component/post-card-component';
import { PostService } from '../../../services/post.service';
import { Post } from '../../../interfaces/post.interface';
import { UpperCasePipe } from '@angular/common';
import { DialogService } from '../../../../shared/services/dialog.service';
import { Subject } from 'rxjs';
import { CreatePostModal } from '../../../../shared/components/create-post-modal/create-post-modal';

@Component({
  selector: 'app-feed-page',
  standalone: true,
  imports: [PostCardComponent, UpperCasePipe],
  templateUrl: './feed-page.html',
  styleUrl: './feed-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedPage implements OnInit {
  private postService = inject(PostService);
  public authService = inject(AuthService); // Público para usarlo en el HTML

  private dialogService = inject(DialogService);

  public posts = signal<Post[]>([]);
  public isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadTimeline();
  }

  loadTimeline(): void {
    this.postService.getTimeline().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          // Extraemos directamente los items con total seguridad
          this.posts.set(res.data.items);
        } else {
          this.posts.set([]);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando el feed', err);
        this.posts.set([]);
        this.isLoading.set(false);
      },
    });
  }

  handleDeletePost(postId: string): void {
    this.postService.deletePost(postId).subscribe({
      next: () => {
        // Si el backend lo borró con éxito, lo sacamos del Signal para actualizar la UI al instante
        this.posts.update((currentPosts) => currentPosts.filter((p) => p.id !== postId));
      },
      error: (err) => console.error('Error al eliminar', err),
    });
  }

  handleLikePost(postId: string): void {
    const post = this.posts().find((p) => p.id === postId);
    if (!post) return;

    if (post.isLiked) {
      this.postService.unlikePost(postId).subscribe({
        next: () => this.toggleLikeUI(postId),
      });
    } else {
      this.postService.likePost(postId).subscribe({
        next: () => this.toggleLikeUI(postId),
      });
    }
  }

  // Método auxiliar para actualizar la tarjeta sin recargar todo el feed
  private toggleLikeUI(postId: string): void {
    this.posts.update((currentPosts) =>
      currentPosts.map((p) => {
        if (p.id === postId) {
          const increment = p.isLiked ? -1 : 1;
          return { ...p, likeCount: p.likeCount + increment, isLiked: !p.isLiked };
        }
        return p;
      }),
    );
  }

  abrirModalPost() {
    const saveSubject = new Subject<void>();
    const successSubject = new Subject<Post>();

    // Escuchamos cuando el modal nos devuelva el post creado con éxito
    successSubject.subscribe((nuevoPost) => {
      this.posts.update(currentPosts => [nuevoPost, ...currentPosts]);
    });
    this.dialogService.open({
      title: 'Nuevo Post',
      component: CreatePostModal,
      btnText: 'Postear',
      onSave: saveSubject,
      onSuccess: successSubject
    });
  }
}
