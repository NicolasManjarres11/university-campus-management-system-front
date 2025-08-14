import { Routes } from "@angular/router";

export const grades_routes: Routes = [
    {
        path: '',
        loadComponent: () => import('@features/grades/components/grades/grades').then(c => c.Grades)
      }
]