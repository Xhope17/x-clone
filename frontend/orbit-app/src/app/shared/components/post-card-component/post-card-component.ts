import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  signal,
} from '@angular/core';
import { UpperCasePipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Post } from '../../../features/interfaces/post.interface';
import { LinkifyPipe } from '../../pipes/LinkifyPipe-pipe';
import { PostService } from '../../../features/services/post.service';
import { BookmarkService } from '../../../features/services/bookmark.service';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [UpperCasePipe, DatePipe, RouterLink, LinkifyPipe],
  templateUrl: './post-card-component.html',
  styleUrl: './post-card-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostCardComponent implements OnDestroy {
  private el = inject(ElementRef);
  private postService = inject(PostService);
  private bookmarkService = inject(BookmarkService);

  post = input.required<Post>();
  currentUserId = input<string | null>(null);

  onDelete = output<string>();
  onLike = output<string>();
  onSave = output<string>();

  fetchedOriginalPost = signal<Post | null>(null);

  constructor() {
    effect(
      () => {
        const p = this.post();
        const orig = p.originalPost ?? this.fetchedOriginalPost();

        if (!orig && (p.isRepost || p.isThread) && p.originalPostId) {
          this.postService.getPostById(p.originalPostId).subscribe({
            next: (res) => {
              if (res.isSuccess && res.data) {
                this.fetchedOriginalPost.set(res.data);
              }
            },
          });
        } else if (p.originalPost) {
          this.fetchedOriginalPost.set(p.originalPost);
        }
      },
      { allowSignalWrites: true },
    );
  }

  ngOnDestroy() {
    const videos = this.el.nativeElement.querySelectorAll('video');
    videos.forEach((video: HTMLVideoElement) => {
      video.pause();
      video.removeAttribute('src');
      video.load();
    });
  }

  displayOriginalPost = computed(() => {
    return this.post().originalPost ?? this.fetchedOriginalPost();
  });

  displayContent = computed(() => {
    const p = this.post();
    const orig = this.displayOriginalPost();
    if (p.isRepost && orig) {
      return orig.content;
    }
    return p.content;
  });

  displayMedia = computed(() => {
    const p = this.post();
    const orig = this.displayOriginalPost();
    if (p.isRepost && orig) {
      return orig.media;
    }
    return p.media;
  });

  displayCreatedAt = computed(() => {
    const p = this.post();
    const orig = this.displayOriginalPost();
    if (p.isRepost && orig) {
      return orig.createdAt;
    }
    return p.createdAt;
  });

  displayAuthor = computed(() => {
    const p = this.post();
    const orig = this.displayOriginalPost();
    if (p.isRepost && orig) {
      return orig.author;
    }
    return p.author;
  });

  // displayCommunityName = computed(() => {
  //   const p = this.post();
  //   const orig = this.displayOriginalPost();
  //   if (p.isRepost && orig) {
  //     return orig.community; // Asumiendo que tu backend envía este campo
  //   }
  //   return p.communityName;
  // });

  // displayCommunitySlug = computed(() => {
  //   const p = this.post();
  //   const orig = this.displayOriginalPost();
  //   if (p.isRepost && orig) {
  //     return orig.communitySlug; // Asumiendo que tu backend envía este campo
  //   }
  //   return p.communitySlug;
  // });

  displayTargetId = computed(() => {
    const p = this.post();
    if (p.isRepost) {
      return p.originalPostId ?? p.id;
    }
    return p.id;
  });

  displayCommentCount = computed(() => {
    const p = this.post();
    const orig = this.displayOriginalPost();
    if (p.isRepost && orig) {
      return orig.commentCount;
    }
    return p.commentCount;
  });

  displayLikeCount = computed(() => {
    const p = this.post();
    const orig = this.displayOriginalPost();
    if (p.isRepost && orig) {
      return orig.likeCount;
    }
    return p.likeCount;
  });

  displayIsLiked = computed(() => {
    const p = this.post();
    const orig = this.displayOriginalPost();
    if (p.isRepost && orig) {
      return orig.isLiked;
    }
    return p.isLiked;
  });

  displayIsSaved = computed(() => {
    const p = this.post();
    const orig = this.displayOriginalPost();
    if (p.isRepost && orig) {
      return orig.isSaved;
    }
    return p.isSaved;
  });

  handleLike() {
    const p = this.post();
    const orig = this.displayOriginalPost();
    if (p.isRepost && orig) {
      const postId = orig.id;
      if (orig.isLiked) {
        this.postService.disLike(postId).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.fetchedOriginalPost.update((o) =>
                o ? { ...o, isLiked: false, likeCount: Math.max(0, o.likeCount - 1) } : null,
              );
            }
          },
        });
      } else {
        this.postService.toggleLike(postId).subscribe({
          next: (res) => {
            if (res.isSuccess && res.data) {
              this.fetchedOriginalPost.update((o) =>
                o ? { ...o, isLiked: res.data.isLiked, likeCount: res.data.likeCount } : null,
              );
            }
          },
        });
      }
      return;
    }
    this.onLike.emit(p.id);
  }

  handleSave() {
    const p = this.post();
    const orig = this.displayOriginalPost();
    if (p.isRepost && orig) {
      const postId = orig.id;
      if (orig.isSaved) {
        this.bookmarkService.unSavePost(postId).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.fetchedOriginalPost.update((o) =>
                o ? { ...o, isSaved: false, saveCount: o.saveCount - 1 } : null,
              );
            }
          },
        });
      } else {
        this.bookmarkService.savePost(postId).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.fetchedOriginalPost.update((o) =>
                o ? { ...o, isSaved: true, saveCount: o.saveCount + 1 } : null,
              );
            }
          },
        });
      }
      return;
    }
    this.onSave.emit(p.id);
  }
}
