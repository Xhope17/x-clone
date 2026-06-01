import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-generic-dialog',
  standalone: true,
  imports: [NgComponentOutlet],
  templateUrl: './generic-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericDialogComponent {
  public dialogService = inject(DialogService);

  onSaveClick() {
    const currentData = this.dialogService.data();
    if (currentData?.onSave) {
      currentData.onSave.next();
    }
  }

  close() {
    this.dialogService.close();
  }
}
