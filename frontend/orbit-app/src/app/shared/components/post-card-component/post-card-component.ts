import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { UpperCasePipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

// Define la estructura de los datos que recibe la tarjeta
export interface Post {
  id: number;
  userId: number;
  name: string;
  username: string;
  content: string;
  createdAt: string | Date;
  likes: number;
  comments: number;
  reposts: number;
}

@Component({
  selector: 'app-post-card', // Simplifiqué el selector para que sea más corto de usar en el HTML
  standalone: true,
  imports: [UpperCasePipe, DatePipe, RouterLink],
  templateUrl: './post-card-component.html',
  styleUrl: './post-card-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostCardComponent {
  // Recibe la información del post
  post = input.required<Post>();

  // Recibe el ID del usuario logueado. Útil para la lógica de eliminación.
  currentUserId = input<number | null>(null);

  // Emite eventos hacia el componente padre (home-page o profile-page)
  onDelete = output<number>();
  onLike = output<number>();
}
