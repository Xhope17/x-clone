import { DatePipe, UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PostComment } from '../../../features/interfaces/post.interface';
import { DialogService } from '../../services/dialog.service';
import { Subject, take } from 'rxjs';

@Component({
  selector: 'comment-item-component',
  imports: [RouterLink, DatePipe, UpperCasePipe],
  templateUrl: './comment-item-component.html',
  styleUrl: './comment-item-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentItemComponent {
  // Recibimos el comentario y el ID del usuario actual (para saber si mostrar el basurero)
  comment = input.required<PostComment>();
  currentUserId = input<string | null>(null);

  // Emitimos el ID cuando se quiera eliminar
  onDelete = output<string>();
  onLike = output<string>();
  private dialogService = inject(DialogService);

  handleDelete() {
    // Evita abrir múltiples modales si el usuario da varios clics rápidos
    if (this.dialogService.data()) return;

    const confirmSubject = new Subject<void>();

    // Escuchamos la confirmación del modal
    confirmSubject.pipe(take(1)).subscribe(() => {
      // 1. Emitimos el ID del comentario al padre (PostDetailPage)
      this.onDelete.emit(this.comment().id);
      // 2. Cerramos el modal
      this.dialogService.close();
    });

    // Abrimos el modal genérico
    this.dialogService.open({
      title: '¿Eliminar respuesta?',
      message:
        'Esta acción es permanente y no se puede deshacer. Se eliminará de esta publicación.',
      btnText: 'Eliminar',
      btnClass: 'btn-error text-white',
      onSave: confirmSubject,
    });
  }

  handleLike() {
    this.onLike.emit(this.comment().id);
  }
}
