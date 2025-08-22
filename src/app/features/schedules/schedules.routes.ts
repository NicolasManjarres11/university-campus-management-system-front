import { Routes } from "@angular/router";

export const schedules_routes: Routes = [
    {
        path: '',
        loadComponent: () => import('@features/schedules/components/schedules/schedules').then(c => c.Schedules)
      }
]