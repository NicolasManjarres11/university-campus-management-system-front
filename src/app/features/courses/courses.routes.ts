import { Routes } from "@angular/router";

export const courses_routes: Routes = [
    {
        path: '',
        loadComponent: () => import('@features/courses/components/courses/courses').then(c => c.Courses)
      }
]