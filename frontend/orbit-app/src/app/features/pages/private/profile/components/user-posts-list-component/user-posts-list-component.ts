import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { PostCardComponent } from '../../../../../../shared/components/post-card-component/post-card-component';
import { Post } from '../../../../../interfaces/post.interface';
import { PostService } from '../../../../../services/post.service';
import { UserService } from '../../../../../services/user.service';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { AuthService } from '../../../../../../shared/services/auth.service';
import { UserProfile } from '../../../../../interfaces/user-profile.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { BookmarkService } from '../../../../../services/bookmark.service';
import { Subject } from 'rxjs';
import { CreateQuoteModal } from '../../../feed/components/create-quote-modal/create-quote-modal';
import { CreatePostModal } from '../../../../../../shared/components/create-post-modal/create-post-modal';

@Component({
  selector: 'app-user-posts-list',
  imports: [PostCardComponent],
  templateUrl: './user-posts-list-component.html',
  styleUrl: './user-posts-list-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserPostsList implements OnInit {
  deletePost = output<string>();
  likePost = output<string>();

  private postService = inject(PostService);
  public authService = inject(AuthService);
  public userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private dialogService = inject(DialogService);
  private bookmarkService = inject(BookmarkService);

  public posts = signal<Post[]>([]);
  public isLoading = signal<boolean>(true);

  userProfile = signal<UserProfile | null>(null);
  userNameUrl = signal<string>('');

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const username = params.get('username') || '';
      this.userNameUrl.set(username);
      this.loadPostsProfile();
    });

    // this.loadPostsProfile();
    this.authService.getCurrentUser().subscribe({
      next: (resp) => {
        if (resp) {
          this.userProfile.set(resp.data);
        }
      },
      error: (err) => console.error('Error al cargar perfil', err),
    });
  }

  // isMyProfile() {
  //   if (!this.authService.username() || !this.userNameUrl()) return null;

  //   if (this.authService.username()?.toLowerCase() === this.userNameUrl().toLowerCase()) {
  //     console.log('es mi perfil');
  //     return this.userNameUrl.set(this.authService.username()!);
  //   }
  // }

  isMyProfile = computed(() => {
    return this.authService.username()?.toLowerCase() === this.userNameUrl().toLowerCase();
  });

  loadPostsProfile(): void {
    // this.userNameUrl.set(this.route.snapshot.paramMap.get('username') || '');
    this.isLoading.set(true);
    this.postService.getPostsByUsername(this.userNameUrl()).subscribe({
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

  handleDeletePost(postId: string): void {
    this.postService.deletePost(postId).subscribe({
      next: () => {
        this.posts.update((currentPosts) => currentPosts.filter((p) => p.id !== postId));
      },
      error: (err) => console.error('Error al eliminar', err),
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
}
