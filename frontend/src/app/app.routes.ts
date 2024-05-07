import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full'},
    { path: 'signup', loadComponent: () => import('./signup/signup.component').then((c) => c.SignupComponent)},
    { path: 'login', loadComponent: () => import('./login/login.component').then((c) => c.LoginComponent)},
    { path: 'videos', loadComponent: () => import('./list-videos/list-videos.component').then((c) => c.ListVideosComponent), canActivate: [authGuard]},
    { path: 'video/:username/:title', loadComponent: () => import('./video/video.component').then((c) => c.VideoComponent), canActivate: [authGuard]},
    { path: 'user-management', loadComponent: () => import('./user-management/user-management.component').then((c) => c.UserManagementComponent), canActivate: [authGuard]},
    { path: '**', redirectTo: 'login'}
];
