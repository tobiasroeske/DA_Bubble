import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { BoardComponent } from './board/board.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ResetPasswordComponent } from './login/forgot-password/reset-password/reset-password.component';

export const routes: Routes = [
    {path: '', component: LandingPageComponent},
    {path: 'login', component: LoginComponent},
    {path: 'board', component: BoardComponent},
    {path: 'register', component: RegisterComponent},
    {path: 'resetpassword', component: ResetPasswordComponent},

];
