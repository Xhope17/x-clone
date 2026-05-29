import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ProfileLayout } from "../../../../core/layouts/private/profile-layout/profile-layout";
import { PostCardComponent } from "../../../../shared/components/post-card-component/post-card-component";
import { FeedPage } from "../feed-page/feed-page";

@Component({
  selector: 'app-home-page',
  imports: [ProfileLayout, PostCardComponent, FeedPage],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {




}
