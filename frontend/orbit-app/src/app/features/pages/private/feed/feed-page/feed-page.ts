import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../../../shared/services/auth.service';
import { PostCardComponent } from '../../../../../shared/components/post-card-component/post-card-component';
import { PostService } from '../../../../services/post.service';
import { Post } from '../../../../interfaces/post.interface';
import { UpperCasePipe } from '@angular/common';
import { DialogService } from '../../../../../shared/services/dialog.service';
import { Subject, take } from 'rxjs';
import { CreatePostModal } from '../../../../../shared/components/create-post-modal/create-post-modal';
import { CreateQuoteModal } from '../components/create-quote-modal/create-quote-modal';
import { UserService } from '../../../../services/user.service';
import { UserProfile } from '../../../../interfaces/user-profile.interface';
import { BookmarkService } from '../../../../services/bookmark.service';
import { FeedHeaderComponent } from '../components/feed-header-component/feed-header-component';
import { QuickPostInputComponent } from '../components/quick-post-input-component/quick-post-input-component';

@Component({
  selector: 'app-feed-page',
  standalone: true,
  imports: [PostCardComponent, UpperCasePipe, FeedHeaderComponent, QuickPostInputComponent],
  templateUrl: './feed-page.html',
  styleUrl: './feed-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedPage implements OnInit {
  private postService = inject(PostService);
  public authService = inject(AuthService);
  public userService = inject(UserService);

  private dialogService = inject(DialogService);
  //guardados
  private bookmarkService = inject(BookmarkService);

  public posts = signal<Post[]>([]);
  public isLoading = signal<boolean>(true);
  // para evitar bugs al eliminar rápidamente
  public deletingPosts = signal<string[]>([]);

  //evitar multiples clicks en el refresh
  public canRefresh = signal<boolean>(true);

  public activeTab = signal<'foryou' | 'following'>('foryou');
  //para mostrar el cd del botón refresh
  public showCooldownWarning = signal<boolean>(false);

  userProfile = signal<UserProfile | null>(null);

  ngOnInit(): void {
    this.loadTimeline();

    this.authService.getCurrentUser().subscribe({
      next: (resp) => {
        if (resp) {
          this.userProfile.set(resp.data);
        }
      },
      error: (err) => console.error('Error al cargar perfil', err),
    });
  }

  loadTimeline(): void {
    this.isLoading.set(true);

    // Si estás en "foryou" llama al timeline general, si no, al de "following"
    const request$ =
      this.activeTab() === 'foryou'
        ? this.postService.getTimeline()
        : this.postService.getFollowingTimeline(); // <- Aquí entra en acción tu nuevo método

    request$.subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
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
    // this.postService.getTimeline().subscribe({
    //   next: (res) => {
    //     if (res.isSuccess && res.data) {
    //       this.posts.set(res.data.items);
    //     } else {
    //       this.posts.set([]);
    //     }
    //     this.isLoading.set(false);
    //   },
    //   error: (err) => {
    //     console.error('Error cargando el feed', err);
    //     this.posts.set([]);
    //     this.isLoading.set(false);
    //   },
    // });
  }

  setTab(tab: 'foryou' | 'following') {
    if (this.activeTab() === tab) return; // Si ya está en esa pestaña, no hace nada

    window.scrollTo({ top: 0, behavior: 'instant' });
    this.activeTab.set(tab);
    this.posts.set([]); // Limpiamos la pantalla
    this.loadTimeline(); // Cargamos los nuevos posts
  }

  // refreshFeed(): void {
  //   if (this.isLoading()) return; // Evita recargar si ya se está cargando

  //   if (!this.canRefresh()) {
  //     this.showCooldownWarning.set(true);

  //     // Ocultamos el aviso automáticamente
  //     setTimeout(() => {
  //       this.showCooldownWarning.set(false);
  //     }, 3000); //3 segundos

  //     return;
  //   }

  //   this.posts.set([]);
  //   this.loadTimeline();

  //   // vuelve al inicio de la pagina para ver el nuevo contenido
  //   window.scrollTo({ top: 0, behavior: 'smooth' });

  //   // cd de 10 segundos para evitar spam de refresh
  //   this.canRefresh.set(false);
  //   setTimeout(() => {
  //     this.canRefresh.set(true);
  //   }, 10000);
  // }

  refreshFeed(): void {
    if (this.isLoading()) return;
    if (!this.canRefresh()) {
      this.showCooldownWarning.set(true);
      setTimeout(() => this.showCooldownWarning.set(false), 3000);
      return;
    }

    this.posts.set([]);
    this.loadTimeline(); // Volverá a llamar al endpoint correcto según el activeTab()

    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.canRefresh.set(false);
    setTimeout(() => this.canRefresh.set(true), 10000);
  }

  handleDeletePost(postId: string): void {
    if (this.dialogService.data()) return;
    if (this.deletingPosts().includes(postId)) return;

    const confirmSubject = new Subject<void>();

    //para no hacer multiples clicks mientras se elimina
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

    //se llama al generic dialog
    this.dialogService.open({
      title: '¿Eliminar publicación?',
      message:
        'Esta acción es permanente y no se puede deshacer. Se eliminará la publicación de tu perfil.',
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

  abrirModalPost() {
    const saveSubject = new Subject<void>();
    const successSubject = new Subject<Post>();

    successSubject.subscribe((nuevoPost) => {
      this.posts.update((currentPosts) => [nuevoPost, ...currentPosts]);
    });
    this.dialogService.open({
      title: 'Nuevo Post',
      component: CreatePostModal,
      btnText: 'Postear',
      onSave: saveSubject,
      onSuccess: successSubject,
    });
  }

  //guardados | bookmarks
  handleSavePost(postId: string): void {
    const post = this.posts().find((p) => p.id === postId);
    if (!post) return;

    if (post.isSaved) {
      // Si ya está guardado, lo quitamos
      this.bookmarkService.unSavePost(postId).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toggleSaveUI(postId, false);
          }
        },
        error: (err) => console.error('Error al quitar guardado', err),
      });
    } else {
      // Si no está guardado, lo guardamos
      this.bookmarkService.savePost(postId).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toggleSaveUI(postId, true);
          }
        },
        error: (err) => console.error('Error al guardar post', err),
      });
    }
  }

  private toggleSaveUI(postId: string, isSaved: boolean): void {
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

    successSubject.subscribe((newPost) => {
      this.posts.update((currentPosts) => [newPost, ...currentPosts]);
    });

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
    // repost is handled by PostCardComponent + RepostStateService internally
  }
}
