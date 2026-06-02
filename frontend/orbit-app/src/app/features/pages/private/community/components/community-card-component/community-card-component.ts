import { UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Community } from '../../../../../interfaces/community-interface';

@Component({
  selector: 'community-card-component',
  imports: [RouterLink, UpperCasePipe],
  templateUrl: './community-card-component.html',
  styleUrl: './community-card-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunityCardComponent {
  // Recibe la data de la comunidad desde el padre
  community = input.required<Community>();

  // Emitimos un evento en caso de que el usuario haga clic en el botón de unirse directamente
  onJoinClick = output<string>();
}
