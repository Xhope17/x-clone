import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GenericDialogComponent } from './shared/components/generic-dialog/generic-dialog';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GenericDialogComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('orbit-app');
}
