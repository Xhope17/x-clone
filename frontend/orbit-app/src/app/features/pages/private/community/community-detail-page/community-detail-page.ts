import { UpperCasePipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PostCardComponent } from '../../../../../shared/components/post-card-component/post-card-component';
import { Community } from '../../../../interfaces/community-interface';
import { Post } from '../../../../interfaces/post.interface';
import { CommunityService } from '../../../../services/community.service';
import { HttpErrorResponse } from '@angular/common/http';

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

  public community = signal<Community | null>(null);
  public posts = signal<Post[]>([]);
  public isLoading = signal(true);
  public currentSlug = signal<string>('');

  public errorState = signal<'not-found' | 'forbidden' | 'server-error' | null>(null);

  ngOnInit() {
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

  toggleJoin() {}

  handleDeletePost(postId: string) {
    /* ... */
  }
  handleLikePost(postId: string) {
    /* ... */
  }
  handleSavePost(postId: string) {
    /* ... */
  }
}
