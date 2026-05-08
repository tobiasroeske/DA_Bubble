import { Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-landing-page',
    imports: [RouterLink, RouterOutlet],
    templateUrl: './landing-page.component.html',
    styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {

}
