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
import { UpperCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Post } from '../../../features/interfaces/post.interface';
import { LinkifyPipe } from '../../pipes/LinkifyPipe-pipe';
import { LocalDatePipe } from '../../pipes/local-date.pipe';
import { PostService } from '../../../features/services/post.service';
import { BookmarkService } from '../../../features/services/bookmark.service';
import { RepostStateService } from '../../services/repost-state.service';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [UpperCasePipe, RouterLink, LinkifyPipe, LocalDatePipe],
  templateUrl: './post-card-component.html',
  styleUrl: './post-card-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostCardComponent implements OnDestroy {
  private el = inject(ElementRef);
  private postService = inject(PostService);
  private bookmarkService = inject(BookmarkService);
  private repostState = inject(RepostStateService);

  post = input.required<Post>();
  currentUserId = input<string | null>(null);

  onDelete = output<string>();
  onLike = output<string>();
  onSave = output<string>();
  onQuote = output<Post>();
  onRepost = output<string>();

  fetchedOriginalPost = signal<Post | null>(null);
  linkCopied = signal(false);

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

  targetForActions = computed(() => {
    const p = this.post();
    const orig = this.displayOriginalPost();
    return (p.isRepost && orig) ? orig : p;
  });

  isRepostedByCurrentUser = computed(() => {
    return this.repostState.isReposted(this.targetForActions().id);
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

  handleRepost() {
    const target = this.targetForActions();
    const targetId = target.id;

    if (this.isRepostedByCurrentUser()) {
      const repostId = this.repostState.getRepostId(targetId);
      if (repostId) {
        this.postService.deletePost(repostId).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.repostState.removeRepost(targetId);
              this.onRepost.emit(targetId);
            }
          },
          error: () => {
            this.repostState.removeRepost(targetId);
          },
        });
      }
    } else {
      this.postService.repostPost(targetId).subscribe({
        next: (res) => {
          if (res.isSuccess && res.data) {
            this.repostState.markReposted(targetId, res.data.id);
            this.onRepost.emit(targetId);
          }
        },
        error: (err) => {
          const msg = err.error?.message || '';
          if (msg.includes('AlreadyReposted')) {
            this.repostState.markReposted(targetId, '');
          }
        },
      });
    }
  }

  handleQuote() {
    this.onQuote.emit(this.targetForActions());
  }

  copyLink() {
    const link = `${window.location.origin}/i/post/${this.displayTargetId()}`;
    navigator.clipboard.writeText(link).then(() => {
      this.linkCopied.set(true);
      setTimeout(() => this.linkCopied.set(false), 2000);
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = link;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      this.linkCopied.set(true);
      setTimeout(() => this.linkCopied.set(false), 2000);
    });
  }
}
