import { Component,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-impressum',
    imports: [],
    templateUrl: './impressum.component.html',
    styleUrl: './impressum.component.scss'
})
export class ImpressumComponent {

  closeWindow() {
    window.close();
  }
}
