import { Component, LOCALE_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import * as de from '@angular/common/locales/de';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  providers: [{ provide: LOCALE_ID, useValue: 'de-DE'}],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'da_bubble';
  constructor() {
    registerLocaleData(de.default)
  }
}
