import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'member-list-item-component',
  imports: [],
  templateUrl: './member-list-item-component.html',
  styleUrl: './member-list-item-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberListItemComponent {}
