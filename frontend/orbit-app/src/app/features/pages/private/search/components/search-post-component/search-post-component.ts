import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { PostCardComponent } from '../../../../../../shared/components/post-card-component/post-card-component';
import { PostService } from '../../../../../services/post.service';
import { Subject, take } from 'rxjs';
import { AuthService } from '../../../../../../shared/services/auth.service';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { Post } from '../../../../../interfaces/post.interface';
import { BookmarkService } from '../../../../../services/bookmark.service';
import { CreateQuoteModal } from '../../../feed/components/create-quote-modal/create-quote-modal';
import { CreatePostModal } from '../../../../../../shared/components/create-post-modal/create-post-modal';

@Component({
  selector: 'search-post-component',
  imports: [PostCardComponent],
  templateUrl: './search-post-component.html',
  styleUrl: './search-post-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchPostComponent {
  query = input.required<string>();

  private postService = inject(PostService);
  public authService = inject(AuthService);
  private dialogService = inject(DialogService);
  private bookmarkService = inject(BookmarkService);

  public posts = signal<Post[]>([]);
  public isLoading = signal<boolean>(true);
  public deletingPosts = signal<string[]>([]);

  constructor() {
    // El effect() se dispara cada vez que la señal query() cambia
    effect(
      () => {
        const currentQuery = this.query();
        if (currentQuery) {
          this.loadPosts(currentQuery);
        }
      },
      { allowSignalWrites: true },
    );
  }

  loadPosts(searchQuery: string): void {
    window.scrollTo({ top: 0, behavior: 'instant' });

    this.isLoading.set(true);
    this.postService.searchPosts(searchQuery).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.posts.set(res.data.items);
        } else {
          this.posts.set([]);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error buscando posts', err);
        this.posts.set([]);
        this.isLoading.set(false);
      },
    });
  }

  handleDeletePost(postId: string): void {
    if (this.dialogService.data()) return;
    if (this.deletingPosts().includes(postId)) return;

    const confirmSubject = new Subject<void>();

    confirmSubject.pipe(take(1)).subscribe(() => {
      this.deletingPosts.update((ids) => [...ids, postId]);

      this.postService.deletePost(postId).subscribe({
        next: () => {
          this.posts.update((currentPosts) => currentPosts.filter((p) => p.id !== postId));
          this.deletingPosts.update((ids) => ids.filter((id) => id !== postId));
          this.dialogService.close();
        },
        error: (err) => {
          console.error('Error al eliminar', err);
          this.deletingPosts.update((ids) => ids.filter((id) => id !== postId));
          alert('Hubo un error al eliminar');
        },
      });
    });

    this.dialogService.open({
      title: '¿Eliminar publicación?',
      message:
        'Esta acción es permanente y no se puede deshacer. Se eliminará de tu perfil y de los resultados de búsqueda.',
      btnText: 'Eliminar',
      btnClass: 'btn-error text-white',
      onSave: confirmSubject,
    });
  }

  handleEditPost(post: Post): void {
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

  handleSavePost(postId: string): void {
    const post = this.posts().find((p) => p.id === postId);
    if (!post) return;

    if (post.isSaved) {
      this.bookmarkService.unSavePost(postId).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.posts.update((currentPosts) =>
              currentPosts.map((p) =>
                p.id === postId ? { ...p, isSaved: false, saveCount: p.saveCount - 1 } : p,
              ),
            );
          }
        },
        error: (err) => console.error('Error al quitar guardado', err),
      });
    } else {
      this.bookmarkService.savePost(postId).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.posts.update((currentPosts) =>
              currentPosts.map((p) =>
                p.id === postId ? { ...p, isSaved: true, saveCount: p.saveCount + 1 } : p,
              ),
            );
          }
        },
        error: (err) => console.error('Error al guardar post', err),
      });
    }
  }

  handleQuotePost(post: Post): void {
    const saveSubject = new Subject<void>();
    this.dialogService.open({
      title: 'Citar publicación',
      component: CreateQuoteModal,
      btnText: 'Citar',
      onSave: saveSubject,
      componentInputs: { originalPost: post },
    });
  }

  handleRepostPost(_postId: string): void {
    // handled internally by PostCardComponent + RepostStateService
  }

  handleLikePost(postId: string): void {
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
}
