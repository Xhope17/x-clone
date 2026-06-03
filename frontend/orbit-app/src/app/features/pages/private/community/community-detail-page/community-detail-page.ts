import { UpperCasePipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PostCardComponent } from '../../../../../shared/components/post-card-component/post-card-component';
import { Community } from '../../../../interfaces/community-interface';
import { Post } from '../../../../interfaces/post.interface';
import { CommunityService } from '../../../../services/community.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DialogService } from '../../../../../shared/services/dialog.service';
import { Subject } from 'rxjs';
import { CreatePostModal } from '../../../../../shared/components/create-post-modal/create-post-modal';
import { BookmarkService } from '../../../../services/bookmark.service';
import { PostService } from '../../../../services/post.service';
import { AuthService } from '../../../../../shared/services/auth.service';

@Component({
  selector: 'app-community-detail-page',
  imports: [PostCardComponent, UpperCasePipe, DatePipe, RouterLink],
  templateUrl: './community-detail-page.html',
  styleUrl: './community-detail-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunityDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private communityService = inject(CommunityService);
  private dialogService = inject(DialogService);

  private authService = inject(AuthService); // <-- Inyectar
  public currentUserId = signal<string | null>(null);

  private postService = inject(PostService);
  private bookmarkService = inject(BookmarkService);

  public community = signal<Community | null>(null);
  public posts = signal<Post[]>([]);
  public isLoading = signal(true);
  public currentSlug = signal<string>('');

  public errorState = signal<'not-found' | 'forbidden' | 'server-error' | null>(null);

  ngOnInit() {
    this.authService.getCurrentUser().subscribe({
      next: (resp) => {
        if (resp) {
          this.currentUserId.set(resp.data.id);
        }
      },
      error: (err) => console.error('Error al cargar perfil', err),
    });

    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        this.currentSlug.set(slug);
        this.loadCommunityData(slug);
      }
    });
  }

  loadCommunityData(slug: string) {
    this.isLoading.set(true);
    this.errorState.set(null);

    // Cargar la info de la comunidad
    this.communityService.getCommunity(slug).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.community.set(res.data);
        }
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 404) {
          this.errorState.set('not-found');
        } else {
          this.errorState.set('server-error');
        }
        this.isLoading.set(false);
      },
    });

    //Cargar los posts de esta comunidad
    this.communityService.getCommunityPosts(slug).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.posts.set(res.data.items);
        }
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        // Si da 403 no somos miembros
        if (err.status === 403) {
          this.errorState.set('forbidden');
        }
        this.isLoading.set(false);
      },
    });
  }

  openCreatePostModal() {
    const slug = this.currentSlug();
    if (!slug) return;

    const onSaveTrigger = new Subject<void>();

    const onSuccess = new Subject<Post>();

    onSuccess.subscribe((nuevoPost: Post) => {
      this.posts.update((currentPosts) => [nuevoPost, ...currentPosts]);
    });

    this.dialogService.open({
      title: 'Crear publicación',
      btnText: 'Publicar',
      component: CreatePostModal,
      onSave: onSaveTrigger,
      onSuccess: onSuccess,
      componentInputs: {
        communitySlug: slug,
      },
    });
  }

  toggleJoin() {
    const comm = this.community();
    const slug = this.currentSlug();

    if (!slug) return;

    if (!comm || comm.isPrivate) {
      this.communityService.requestToJoin(slug).subscribe({
        next: () => alert('Solicitud enviada correctamente. Espera a que un moderador la apruebe.'),
        error: (err) =>
          alert('Error: ' + (err.error?.message || 'Ya enviaste una solicitud previamente.')),
      });
    } else if (!comm.isMember) {
      // Si es pública y no somos miembros, nos unimos directamente
      this.communityService.joinCommunity(slug).subscribe({
        next: () => {
          // Actualizamos la UI
          this.community.update((c) => (c ? { ...c, isMember: true } : c));
          alert('¡Te has unido a la comunidad!');
        },
        error: (err) =>
          alert('Error: ' + (err.error?.message || 'No se pudo unir a la comunidad.')),
      });
    }
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

  handleSavePost(postId: string): void {
    const post = this.posts().find((p) => p.id === postId);
    if (!post) return;

    if (post.isSaved) {
      this.bookmarkService.unSavePost(postId).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toggleSaveUI(postId, false);
          }
        },
        error: (err) => console.error('Error al quitar guardado', err),
      });
    } else {
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

  handleDeletePost(postId: string): void {
    const confirmSubject = new Subject<void>();

    confirmSubject.subscribe(() => {
      this.postService.deletePost(postId).subscribe({
        next: () => {
          this.posts.update((currentPosts) => currentPosts.filter((p) => p.id !== postId));
          this.dialogService.close();
        },
        error: (err) => {
          console.error('Error al eliminar', err);
          alert('Hubo un error al eliminar');
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
}
