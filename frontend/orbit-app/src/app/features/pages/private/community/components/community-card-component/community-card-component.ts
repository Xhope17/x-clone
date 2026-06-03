import { UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { Community } from '../../../../../interfaces/community-interface';

@Component({
  selector: 'community-card-component',
  imports: [UpperCasePipe],
  templateUrl: './community-card-component.html',
  styleUrl: './community-card-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunityCardComponent {
  community = input.required<Community>();

  private router = inject(Router);

  onJoinClick = output<string>();

  onCardClick() {
    const comm = this.community();
    if (!comm.isPrivate || comm.isMember) {
      this.router.navigate(['/c', comm.slug]);
    } else {
      alert(
        'Esta comunidad es privada.\n\n' +
          'Para ver su contenido, primero debes enviar una solicitud de acceso y esperar a que un moderador la apruebe.',
      );
    }
  }

  onButtonClick(event: Event) {
    event.stopPropagation();
    const comm = this.community();

    if (comm.isMember) {
      this.router.navigate(['/c', comm.slug]);
    } else if (comm.hasPendingJoinRequest) {
      alert('Ya enviaste una solicitud para unirte a esta comunidad. Espera a que un moderador la revise.');
    } else {
      this.onJoinClick.emit(comm.slug);
    }
  }
}
