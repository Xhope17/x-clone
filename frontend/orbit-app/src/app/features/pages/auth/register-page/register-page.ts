import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage {
  private _fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  public hasError = signal<boolean>(false);
  public isPosting = signal<boolean>(false);

  public registerForm = this._fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.hasError.set(true);
      setTimeout(() => this.hasError.set(false), 3000);
      return;
    }

    this.hasError.set(false);
    this.isPosting.set(true);

    const userData = this.registerForm.getRawValue();

    // usa el metodo generico temporal
    this.authService.register(userData).subscribe({
      next: () => {
        this.isPosting.set(false);
        this.router.navigateByUrl('/auth/login');
      },
      error: () => {
        this.isPosting.set(false);
        this.hasError.set(true);
        setTimeout(() => this.hasError.set(false), 3000);
      }
    });
  }
}
