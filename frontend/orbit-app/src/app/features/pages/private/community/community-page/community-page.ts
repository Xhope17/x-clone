import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Community } from '../../../../interfaces/community-interface';
import { CommunityService } from '../../../../services/community.service';
import { CommunityCardComponent } from '../components/community-card-component/community-card-component';
import { CreateCommunityModalComponent } from '../components/create-community-modal-component/create-community-modal-component';
import { DialogService } from '../../../../../shared/services/dialog.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

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
  // Estados
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

    const request$ =
      this.activeTab() === 'my-communities'
        ? this.communityService.getMyCommunities()
        : this.communityService.searchCommunities(query);

    request$.subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.communities.set(res.data.items);
        } else {
          this.communities.set([]);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando comunidades', err);
        this.communities.set([]);
        this.isLoading.set(false);
      },
    });
  }

  // Se activa cuando el usuario escribe en el buscador
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    const query = input.value.trim();

    // Si estás en "Descubrir", busca en la base de datos
    if (this.activeTab() === 'discover') {
      this.loadCommunities(query);
    }
  }

  handleJoinCommunity(slug: string) {
    // Si el usuario ya es miembro y le da a "Ver", lo llevas a la ruta.
    // Si no es miembro, llamas al endpoint de unirse.
    // Por ahora, solo mostraremos un console log para que veas que el evento del botón funciona:
    console.log(`Intentando unirse a c/${slug}`);
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

    // Añadimos "as any" para evitar que la interfaz estricta bloquee la compilación
    this.dialogService.open({
      title: 'Crear comunidad',
      btnText: 'Crear',
      component: CreateCommunityModalComponent,
      onSave: onSaveTrigger,
      onSuccess: onSuccess,
    } as any);
  }
}
