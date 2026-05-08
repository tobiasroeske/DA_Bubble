import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'board',
    loadComponent: () => import('./board/board.component').then(m => m.BoardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'resetpassword',
    loadComponent: () =>
      import('./login/forgot-password/reset-password/reset-password.component').then(
        m => m.ResetPasswordComponent
      ),
  },
  {
    path: 'impressum',
    loadComponent: () => import('./impressum/impressum.component').then(m => m.ImpressumComponent),
  },
  {
    path: 'datenschutz',
    loadComponent: () =>
      import('./datenschutz/datenschutz.component').then(m => m.DatenschutzComponent),
  },
  { path: '**', redirectTo: 'login' },
];
