import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogService } from '../../services/dialog.service';
import { PostService } from '../../../features/services/post.service';
import { CommunityService } from '../../../features/services/community.service';

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

  //para comunidades
  public communitySlug = input<string>();
  private communityService = inject(CommunityService);

  public isPosting = signal(false);
  public errorMessage = signal('');

  // archivos y sus vistas previas
  public selectedFiles = signal<File[]>([]);
  public mediaPreviews = signal<{ url: string; type: string }[]>([]);

  public postForm = this.fb.nonNullable.group({
    content: ['', Validators.maxLength(1000)],
  });

  ngOnInit() {
    const data = this.dialogService.data();
    if (data?.onSave) {
      data.onSave.subscribe(() => {
        this.guardarPost();
      });
    }
  }

  // const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  // const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const filesArray = Array.from(input.files);
      const validFiles: File[] = [];

      // 7 mb máximo por archivo
      const MAX_FILE_SIZE = 7 * 1024 * 1024;

      for (const file of filesArray) {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        // valida el formato
        if (!isImage && !isVideo) {
          alert(`El archivo "${file.name}" no es válido. Solo imágenes, GIFs o videos.`);
          continue;
        }

        // valida el peso
        if (file.size > MAX_FILE_SIZE) {
          alert(`El archivo "${file.name}" supera el límite permitido de 7MB.`);
          continue;
        }

        // Si pasa todas las pruebas, lo agregamos a los válidos
        validFiles.push(file);
      }

      // si todo esta bien, los agregamos
      if (validFiles.length > 0) {
        this.addFiles(validFiles);
      }
    }

    input.value = '';
  }

  onPaste(event: ClipboardEvent) {
    const items = event.clipboardData?.items;
    if (!items) return;

    const mediaFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // pegar videos o imágenes
      if (item.type.startsWith('image/') || item.type.startsWith('video/')) {
        const file = item.getAsFile();
        if (file) mediaFiles.push(file);
      }
    }

    if (mediaFiles.length > 0) {
      event.preventDefault();
      this.addFiles(mediaFiles);
    }
  }

  private addFiles(files: File[]) {
    // acepta imágenes y videos
    const validFiles = files.filter(
      (f) => f.type.startsWith('image/') || f.type.startsWith('video/'),
    );

    if (validFiles.length === 0) return;

    this.selectedFiles.update((current) => [...current, ...validFiles]);

    // vista previa de los archivos
    const newPreviews = validFiles.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type,
    }));

    this.mediaPreviews.update((current) => [...current, ...newPreviews]);
  }

  removeMedia(index: number) {
    // se remueve usando su indice
    this.selectedFiles.update((files) => files.filter((_, i) => i !== index));
    this.mediaPreviews.update((previews) => previews.filter((_, i) => i !== index));
  }

  // subir post
  guardarPost() {
    if (this.isPosting()) return;

    const contentText = this.postForm.value.content?.trim() || '';
    const hasMedia = this.selectedFiles().length > 0;

    // validar que haya algo que publicar
    if (!contentText && !hasMedia) {
      this.errorMessage.set('Agrega texto o un archivo multimedia para publicar.');
      return;
    }

    // Si es inválido
    if (this.postForm.invalid) {
      this.errorMessage.set('El post excede el límite de caracteres.');
      return;
    }

    this.isPosting.set(true);
    this.errorMessage.set('');

    const formData = new FormData();

    // envía content si el usuario escribió algo
    if (contentText) {
      formData.append('Content', contentText);
    }

    // Agregamos los archivos si existen
    this.selectedFiles().forEach((file) => {
      formData.append('Media', file);
    });

    const dialogData = this.dialogService.data();
    const slug = (dialogData?.componentInputs as any)?.communitySlug || this.communitySlug();

    const request$ = slug
      ? this.communityService.createCommunityPost(slug, formData) // Post para la comunidad
      : this.postService.createPost(formData); // Post para el muro normal

    request$.subscribe({
      next: (res) => {
        this.isPosting.set(false);
        if (res.isSuccess && res.data) {
          if (dialogData?.onSuccess) {
            dialogData.onSuccess.next(res.data);
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
