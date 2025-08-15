import { Routes } from "@angular/router";
import { Login } from "./components/login/login";
import { Register } from "./components/register/register";

export const users_routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('@features/users/components/login/login').then(c => c.Login)
    },
    {
        path: 'register',
        loadComponent: () => import('@features/users/components/register/register').then(c => c.Register)
    },
    {
        path: 'users',
        loadComponent: () => import('@features/users/components/users/users').then(c => c.Users)
    },

]