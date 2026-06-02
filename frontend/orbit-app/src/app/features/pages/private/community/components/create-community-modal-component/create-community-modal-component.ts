import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { CreateCommunityPayload } from '../../../../../interfaces/community-interface';
import { CommunityService } from '../../../../../services/community.service';

@Component({
  selector: 'create-community-modal-component',
  imports: [ReactiveFormsModule],
  templateUrl: './create-community-modal-component.html',
  styleUrl: './create-community-modal-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateCommunityModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private communityService = inject(CommunityService);
  private dialogService = inject(DialogService);

  public isSubmitting = signal(false);
  public errorMessage = signal('');

  public communityForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    description: ['', [Validators.maxLength(500)]],
    isPrivate: [false],
  });

  ngOnInit() {
    const data = this.dialogService.data();
    if (data?.onSave) {
      data.onSave.subscribe(() => {
        this.crearComunidad();
      });
    }
  }

  crearComunidad() {
    if (this.communityForm.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const payload: CreateCommunityPayload = {
      name: this.communityForm.value.name!.trim(),
      description: this.communityForm.value.description?.trim() || null,
      isPrivate: this.communityForm.value.isPrivate!,
    };

    this.communityService.createCommunity(payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.isSuccess && res.data) {
          const dialogData = this.dialogService.data();
          if (dialogData?.onSuccess) {
            dialogData.onSuccess.next(res.data);
          }
          this.dialogService.close();
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Ocurrió un error al crear la comunidad.');
      },
    });
  }
}
