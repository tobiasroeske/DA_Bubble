import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { BoardComponent } from './board/board.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './login/forgot-password/forgot-password.component';

export const routes: Routes = [
    {path: '', component: LandingPageComponent},
    {path: 'login', component: LoginComponent},
    {path: 'board', component: BoardComponent},
    {path: 'register', component: RegisterComponent},
    {path: 'resetpassword', component: ForgotPasswordComponent},

];
