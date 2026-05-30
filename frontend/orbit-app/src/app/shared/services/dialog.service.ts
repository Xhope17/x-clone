import { Injectable, signal, Type } from '@angular/core';
import { Subject } from 'rxjs';

export interface GenericDialogData {
  title: string;
  component: Type<unknown>;
  btnText?: string;
  onSave?: Subject<void>;
  onSuccess?: Subject<any>;
  componentInputs?: Record<string, unknown>;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
  // Signal que guarda la configuración del modal actual
  public data = signal<GenericDialogData | null>(null);

  open(data: GenericDialogData) {
    this.data.set(data);
    const modal = document.getElementById('generic_dialog') as HTMLDialogElement;
    if (modal) modal.showModal();
  }

  close() {
    const modal = document.getElementById('generic_dialog') as HTMLDialogElement;
    if (modal) modal.close();
    // Limpiamos la data después de una pequeña pausa para que termine la animación de cierre
    setTimeout(() => this.data.set(null), 200);
  }
}
