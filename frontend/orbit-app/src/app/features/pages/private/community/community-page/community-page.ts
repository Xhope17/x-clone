import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Community } from '../../../../interfaces/community-interface';
import { CommunityService } from '../../../../services/community.service';
import { CommunityCardComponent } from '../components/community-card-component/community-card-component';
import { CreateCommunityModalComponent } from '../components/create-community-modal-component/create-community-modal-component';
import { DialogService } from '../../../../../shared/services/dialog.service';
import { Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';

@Component({
  selector: 'app-community-page',
  imports: [CommunityCardComponent],
  templateUrl: './community-page.html',
  styleUrl: './community-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunityPage implements OnInit {
  private communityService = inject(CommunityService);
  private dialogService = inject(DialogService);
  private router = inject(Router);

  public activeTab = signal<'my-communities' | 'discover'>('my-communities');
  public communities = signal<Community[]>([]);
  public isLoading = signal(false);

  ngOnInit() {
    this.loadCommunities();
  }

  setTab(tab: 'my-communities' | 'discover') {
    if (this.activeTab() === tab) return;
    this.activeTab.set(tab);
    this.communities.set([]);

    window.scrollTo({ top: 0, behavior: 'instant' });
    this.loadCommunities();
  }

  loadCommunities(query: string = '') {
    this.isLoading.set(true);

    const isMyTab = this.activeTab() === 'my-communities';
    const communities$ = isMyTab
      ? this.communityService.getMyCommunities()
      : this.communityService.searchCommunities(query);

    const myCommunities$ = isMyTab ? null : this.communityService.getMyCommunities();

    const calls = myCommunities$ ? [communities$, myCommunities$] : [communities$];

    forkJoin(calls).subscribe({
      next: (results: any) => {
        const commRes = results[0];
        const myCommRes = results[1];

        if (commRes.isSuccess && commRes.data) {
          let items = commRes.data.items;

          if (isMyTab) {
            items = items.map((c: Community) => ({ ...c, isMember: true }));
          } else if (myCommRes?.isSuccess && myCommRes?.data) {
            const mySlugs = new Set(myCommRes.data.items.map((c: Community) => c.slug));
            items = items.map((c: Community) => ({
              ...c,
              isMember: mySlugs.has(c.slug) || !!c.isMember,
            }));
          }

          this.communities.set(items);
        } else {
          this.communities.set([]);
        }

        this.isLoading.set(false);
      },
      error: () => {
        this.communities.set([]);
        this.isLoading.set(false);
      },
    });
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    const query = input.value.trim();

    if (this.activeTab() === 'discover') {
      this.loadCommunities(query);
    }
  }

  handleJoinCommunity(slug: string) {
    const comm = this.communities().find((c) => c.slug === slug);
    if (!comm) return;

    if (comm.isMember) {
      this.router.navigate(['/c', slug]);
    } else if (comm.isPrivate) {
      this.communityService.requestToJoin(slug).subscribe({
        next: () => {
          this.communities.update((list) =>
            list.map((c) => (c.slug === slug ? { ...c, hasPendingJoinRequest: true } : c)),
          );
          alert('Solicitud enviada correctamente.');
        },
        error: (err) => {
          alert('Error: ' + (err.error?.message || 'No se pudo enviar la solicitud.'));
        },
      });
    } else {
      this.communityService.joinCommunity(slug).subscribe({
        next: () => {
          this.communities.update((list) =>
            list.map((c) => (c.slug === slug ? { ...c, isMember: true } : c)),
          );
          alert('Te has unido a la comunidad.');
        },
        error: (err) => {
          alert('Error: ' + (err.error?.message || 'No se pudo unir a la comunidad.'));
        },
      });
    }
  }

  openCreateModal() {
    const onSaveTrigger = new Subject<void>();
    const onSuccess = new Subject<Community>();

    onSuccess.subscribe((nuevaComunidad) => {
      if (this.activeTab() === 'my-communities') {
        this.communities.update((current) => [nuevaComunidad, ...current]);
      }
      this.router.navigate(['/c', nuevaComunidad.slug]);
    });

    this.dialogService.open({
      title: 'Crear comunidad',
      btnText: 'Crear',
      component: CreateCommunityModalComponent,
      onSave: onSaveTrigger,
      onSuccess: onSuccess,
    });
  }
}
