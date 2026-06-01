import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogService } from '../../services/dialog.service';
import { PostService } from '../../../features/services/post.service';

@Component({
  selector: 'app-create-post-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-post-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex-1 flex flex-col',
  },
})
export class CreatePostModal implements OnInit {
  private fb = inject(FormBuilder);
  private postService = inject(PostService);
  private dialogService = inject(DialogService);

  public isPosting = signal(false);
  public errorMessage = signal('');

  // para manejar los archivos y sus vistas previas
  public selectedFiles = signal<File[]>([]);
  public imagePreviews = signal<string[]>([]);

  public postForm = this.fb.nonNullable.group({
    content: ['', [Validators.required, Validators.maxLength(1000)]]
  });

  ngOnInit() {
    const data = this.dialogService.data();
    if (data?.onSave) {
      data.onSave.subscribe(() => {
        this.guardarPost();
      });
    }
  }

  // Para archivos seleccionados por el input
  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const filesArray = Array.from(input.files);
      this.addFiles(filesArray);
    }
    input.value = '';
  }

  onPaste(event: ClipboardEvent) {
    const items = event.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          imageFiles.push(file);
        }
      }
    }

    if (imageFiles.length > 0) {
      event.preventDefault();
      this.addFiles(imageFiles);
    }
  }

  private addFiles(files: File[]) {
    const validFiles = files.filter(f =>
      ['image/png', 'image/jpeg', 'image/webp'].includes(f.type)
    );
    if (validFiles.length === 0) return;

    this.selectedFiles.update(current => [...current, ...validFiles]);
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    this.imagePreviews.update(current => [...current, ...newPreviews]);
  }

  removeImage(index: number) {
    // Removemos el archivo y su vista previa usando su índice
    this.selectedFiles.update(files => files.filter((_, i) => i !== index));
    this.imagePreviews.update(previews => previews.filter((_, i) => i !== index));
  }

  // subir post
  guardarPost() {
    if (this.isPosting()) return;
    if (this.postForm.invalid || !this.postForm.value.content?.trim()) {
      this.errorMessage.set('El post no puede estar vacío.');
      return;
    }

    this.isPosting.set(true);
    this.errorMessage.set('');

    const formData = new FormData();
    formData.append('Content', this.postForm.value.content.trim());

    // Agregamos cada archivo al FormData
    this.selectedFiles().forEach(file => {
      formData.append('Media', file);
    });

    this.postService.createPost(formData).subscribe({
      next: (res) => {
        this.isPosting.set(false);
        if (res.isSuccess && res.data) {
          const data = this.dialogService.data();
          if (data?.onSuccess) {
            data.onSuccess.next(res.data);
          }
          this.dialogService.close();
        }
      },
      error: (err) => {
        this.isPosting.set(false);
        this.errorMessage.set(err.error?.message || 'Error al publicar.');
      },
    });
  }
}
