import { DatePipe, UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PostCardComponent } from '../../../../shared/components/post-card-component/post-card-component';
import { AuthService } from '../../../../shared/services/auth.service';
import { Post, PostComment } from '../../../interfaces/post.interface';
import { PostService } from '../../../services/post.service';
import { Location } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { UserProfile } from '../../../interfaces/user-profile.interface';
import { CommentItemComponent } from '../../../../shared/components/comment-item-component/comment-item-component';
@Component({
  selector: 'app-post-detail-page',
  imports: [PostCardComponent, DatePipe, UpperCasePipe, CommentItemComponent],
  templateUrl: './post-detail-page.html',
  styleUrl: './post-detail-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

  private postService = inject(PostService);
  public authService = inject(AuthService);
  public userService = inject(UserService);
  currentUserProfile = signal<UserProfile | null>(null);

  public post = signal<Post | null>(null);
  public comments = signal<PostComment[]>([]);

  public loading = signal(true);
  public error = signal('');
  public isSubmittingComment = signal(false);

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.authService.getCurrentUser().subscribe({
        next: (res) => {
          if (res.isSuccess && res.data) {
            this.currentUserProfile.set(res.data);
          }
        },
        error: (err) => console.error('Error cargando tu perfil', err),
      });
    }

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadPostAndComments(idParam);
    } else {
      this.error.set('Post no encontrado.');
      this.loading.set(false);
    }
  }

  backClicked() {
    this.location.back();
  }

  // loadUserProfile(username: string) {
  //   this.userService.getUserByUsername(username).subscribe({
  //     next: (resp) => {
  //       if (resp.isSuccess && resp.data) {
  //         this.currentProfile.set(resp.data);
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Error al obtener el usuario actual', username, err);
  //       this.router.navigate(['/home']);
  //     },
  //   });
  // }

  loadPostAndComments(postId: string) {
    this.loading.set(true);

    // PRIMERO pedimos el Post
    this.postService.getPostById(postId).subscribe({
      next: (postRes) => {
        if (postRes.isSuccess && postRes.data) {
          this.post.set(postRes.data);

          // SEGUNDO pedimos los Comentarios
          this.postService.getComments(postId).subscribe({
            next: (commentRes) => {
              if (commentRes.isSuccess && commentRes.data?.items) {
                this.comments.set(commentRes.data.items);
              }
              this.loading.set(false);
            },
            error: () => this.loading.set(false),
          });
        } else {
          this.error.set('No se pudo cargar la publicación.');
          this.loading.set(false);
        }
      },
      error: () => {
        this.error.set('Error de conexión o post inexistente.');
        this.loading.set(false);
      },
    });
  }

  handleDeletePost(postId: string) {
    this.postService.deletePost(postId).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.location.back();
        }
      },
      error: (err) => console.error('Error al eliminar post', err),
    });
  }
  handleLikePost(postId: string) {
    this.postService.toggleLike(postId).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.post.update((p) =>
            p ? { ...p, isLiked: res.data.isLiked, likeCount: res.data.likeCount } : null,
          );
        }
      },
      error: (err) => console.error('Error al dar like', err),
    });
  }

  createComment(postId: string, inputElement: HTMLInputElement) {
    const content = inputElement.value.trim();
    if (!content) return;

    this.isSubmittingComment.set(true);

    this.postService.createComment(postId, content).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.comments.update((comments) => [res.data, ...comments]);
          this.post.update((p) => (p ? { ...p, commentCount: p.commentCount + 1 } : null));
          inputElement.value = '';
        }
        this.isSubmittingComment.set(false);
      },
      error: (err) => {
        console.error('Error al comentar', err);
        this.isSubmittingComment.set(false);
      },
    });
  }

  deleteComment(commentId: string) {
    this.postService.deleteComment(commentId).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          // Filtra el comentario de la lista al instante (Optimistic UI)
          this.comments.update((comments) => comments.filter((c) => c.id !== commentId));
          // Resta 1 al contador del Post sin bajar de 0
          this.post.update((p) =>
            p ? { ...p, commentCount: Math.max(0, p.commentCount - 1) } : null,
          );
        }
      },
      error: (err) => console.error('Error al eliminar comentario', err),
    });
  }

  handleLikeComment(commentId: string) {
    const comment = this.comments().find((c) => c.id === commentId);
    if (!comment) return;

    if (comment.isLiked) {
      // Si ya tiene like, lo quitamos (DELETE)
      this.postService.disLikeComment(commentId).subscribe({
        next: (res) => {
          if (res.isSuccess && res.data) {
            this.toggleCommentLikeUI(commentId, res.data.isLiked, res.data.likeCount);
          }
        },
        error: (err) => console.error('Error al quitar like al comentario', err),
      });
    } else {
      // Si no tiene like, lo damos (POST)
      this.postService.likeComment(commentId).subscribe({
        next: (res) => {
          if (res.isSuccess && res.data) {
            this.toggleCommentLikeUI(commentId, res.data.isLiked, res.data.likeCount);
          }
        },
        error: (err) => console.error('Error al dar like al comentario', err),
      });
    }
  }

  // actualizar la UI
  private toggleCommentLikeUI(commentId: string, isLiked: boolean, likeCount: number): void {
    this.comments.update((currentComments) =>
      currentComments.map((c) => {
        if (c.id === commentId) {
          return { ...c, isLiked, likeCount };
        }
        return c;
      }),
    );
  }
}
