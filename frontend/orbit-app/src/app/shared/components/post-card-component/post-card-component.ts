import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-post-card-component',
  imports: [],
  templateUrl: './post-card-component.html',
  styleUrl: './post-card-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostCardComponent {}
