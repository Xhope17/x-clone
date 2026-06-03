import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { PostCardComponent } from '../../../../shared/components/post-card-component/post-card-component';
import { Subject, take } from 'rxjs';
import { AuthService } from '../../../../shared/services/auth.service';
import { DialogService } from '../../../../shared/services/dialog.service';
import { Post } from '../../../interfaces/post.interface';
import { BookmarkService } from '../../../services/bookmark.service';
import { PostService } from '../../../services/post.service';
import { CreateQuoteModal } from '../feed/components/create-quote-modal/create-quote-modal';
import { CreatePostModal } from '../../../../shared/components/create-post-modal/create-post-modal';

@Component({
  selector: 'app-bookmarks-page',
  imports: [PostCardComponent],
  templateUrl: './bookmarks-page.html',
  styleUrl: './bookmarks-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookmarksPage implements OnInit {
  private bookmarkService = inject(BookmarkService);
  private postService = inject(PostService);
  public authService = inject(AuthService);
  private dialogService = inject(DialogService);

  public posts = signal<Post[]>([]);
  public isLoading = signal<boolean>(true);
  public deletingPosts = signal<string[]>([]);

  ngOnInit() {
    this.loadBookmarks();
  }

  loadBookmarks() {
    this.isLoading.set(true);
    this.bookmarkService.getSavedPosts().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.posts.set(res.data.items);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando bookmarks', err);
        this.isLoading.set(false);
      },
    });
  }

  handleLikePost(postId: string) {
    const post = this.posts().find((p) => p.id === postId);
    if (!post) return;

    if (post.isLiked) {
      this.postService.disLike(postId).subscribe({
        next: () => this.toggleLikeUI(postId),
      });
    } else {
      this.postService.toggleLike(postId).subscribe({
        next: () => this.toggleLikeUI(postId),
      });
    }
  }

  private toggleLikeUI(postId: string) {
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

  handleDeletePost(postId: string) {
    if (this.dialogService.data()) return;
    const confirmSubject = new Subject<void>();

    confirmSubject.pipe(take(1)).subscribe(() => {
      this.postService.deletePost(postId).subscribe({
        next: () => {
          this.posts.update((current) => current.filter((p) => p.id !== postId));
          this.dialogService.close();
        },
      });
    });

    this.dialogService.open({
      title: '¿Eliminar publicación?',
      message: 'Esta acción es permanente y no se puede deshacer.',
      btnText: 'Eliminar',
      btnClass: 'btn-error text-white',
      onSave: confirmSubject,
    });
  }

  handleEditPost(post: Post) {
    const saveSubject = new Subject<void>();
    const successSubject = new Subject<Post>();

    successSubject.subscribe((updatedPost) => {
      this.posts.update((currentPosts) =>
        currentPosts.map((p) => (p.id === post.id ? { ...p, ...updatedPost } : p)),
      );
    });

    this.dialogService.open({
      title: 'Editar publicación',
      component: CreatePostModal,
      btnText: 'Guardar',
      onSave: saveSubject,
      onSuccess: successSubject,
      componentInputs: { postToEdit: post },
    });
  }

  handleSavePost(postId: string) {
    const post = this.posts().find((p) => p.id === postId);
    if (!post) return;

    if (post.isSaved) {
      // Quitar de guardados
      this.bookmarkService.unSavePost(postId).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            // apaga el icono.
            this.toggleSaveUI(postId, false);
          }
        },
        error: (err) => console.error('Error al quitar de guardados', err),
      });
    } else {
      // si el usuario clickeó sin querer puede volver a guardar el post
      this.bookmarkService.savePost(postId).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            // se activa el icono sin recargar la lista completa
            this.toggleSaveUI(postId, true);
          }
        },
        error: (err) => console.error('Error al volver a guardar', err),
      });
    }
  }

  private toggleSaveUI(postId: string, isSaved: boolean) {
    this.posts.update((currentPosts) =>
      currentPosts.map((p) => {
        if (p.id === postId) {
          const increment = isSaved ? 1 : -1;
          return { ...p, isSaved, saveCount: p.saveCount + increment };
        }
        return p;
      }),
    );
  }

  handleQuotePost(post: Post): void {
    const saveSubject = new Subject<void>();
    const successSubject = new Subject<Post>();

    this.dialogService.open({
      title: 'Citar publicación',
      component: CreateQuoteModal,
      btnText: 'Citar',
      onSave: saveSubject,
      onSuccess: successSubject,
      componentInputs: { originalPost: post },
    });
  }

  handleRepostPost(_postId: string): void {
    // repost handled by PostCardComponent + RepostStateService internally
  }
}
