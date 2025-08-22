import { Routes } from "@angular/router";

export const departments_routes: Routes = [
    {
        path: '',
        loadComponent: () => import('@features/departments/components/departments/departments').then(c => c.Departments)
      }
]