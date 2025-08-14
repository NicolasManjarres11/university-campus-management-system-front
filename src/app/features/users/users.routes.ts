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
    }
]