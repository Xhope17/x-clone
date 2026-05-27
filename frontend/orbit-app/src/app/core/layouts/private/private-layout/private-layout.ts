import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-private-layout',
  imports: [],
  templateUrl: './private-layout.html',
  styleUrl: './private-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivateLayout {}
