import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, lastValueFrom, Observable } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { DialogService } from '../../../../shared/services/dialog.service';
import { UserProfile } from '../../../interfaces/user-profile.interface';

@Component({
  selector: 'app-edit-profile-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './edit-profile-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex-1 flex flex-col' }, // Para que ocupe todo el espacio del dialog
})
export class EditProfileModal implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private dialogService = inject(DialogService);

  public currentUser = input.required<UserProfile>();

  public isSaving = signal(false);
  public errorMessage = signal('');

  public newAvatarFile = signal<File | null>(null);
  public newBannerFile = signal<File | null>(null);

  public avatarPreview = signal<string | null>(null);
  public bannerPreview = signal<string | null>(null);

  public profileForm = this.fb.nonNullable.group({
    displayName: ['', [Validators.required, Validators.minLength(3)]],
    bio: [''],
    isPrivate: [false],
  });

  ngOnInit() {
    this.loadData();
    const data = this.dialogService.data();
    if (data?.onSave) {
      data.onSave.subscribe(() => this.saveChanges());
    }
  }

  loadData() {
    const user = this.currentUser();
    this.profileForm.patchValue({
      displayName: user.displayName || '',
      bio: user.bio || '',
      isPrivate: user.isPrivate,
    });

    this.avatarPreview.set(user.avatarUrl);
    this.bannerPreview.set(user.bannerUrl);
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.newAvatarFile.set(file);
      this.avatarPreview.set(URL.createObjectURL(file));
    }
  }

  onBannerSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.newBannerFile.set(file);

      this.bannerPreview.set(URL.createObjectURL(file));
    }
  }
  removeBanner() {
    this.newBannerFile.set(null);
    this.bannerPreview.set(null);
  }

  async saveChanges() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const hasTextChanges = this.profileForm.dirty;
    const hasAvatarChange = !!this.newAvatarFile();
    const hasBannerChange = !!this.newBannerFile() || this.bannerPreview() === null; // Si el preview es null, significa que el usuario eliminó el banner

    if (!hasTextChanges && !hasAvatarChange && !hasBannerChange) {
      this.dialogService.close();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    try {
      //se ejecuta una por una, si una falla, salta al catch
      if (hasTextChanges) {
        await lastValueFrom(this.userService.updateProfile(this.profileForm.getRawValue()));
      }

      if (hasAvatarChange) {
        await lastValueFrom(this.userService.uploadAvatar(this.newAvatarFile()!));
      }

      if (hasBannerChange) {
        if (this.bannerPreview() === null && this.newBannerFile() === null) {
          await lastValueFrom(this.userService.deleteBanner());
        } else {
          await lastValueFrom(this.userService.uploadBanner(this.newBannerFile()!));
        }
      }

      this.isSaving.set(false);
      const dialogData = this.dialogService.data();
      if (dialogData?.onSuccess) {
        dialogData.onSuccess.next(true);
      }
      this.dialogService.close();
    } catch (err: any) {
      this.isSaving.set(false);
      this.errorMessage.set(err.error?.message || 'Ocurrió un error al actualizar el perfil.');
      console.error('Fallo en sincronización:', err);
    }
  }
}
