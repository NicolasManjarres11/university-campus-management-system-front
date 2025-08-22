import { Routes } from '@angular/router';
import { roleGuard } from '@core/guards/role.guard';
import { UserRole } from '@features/users/models/user.model';
import { MainLayout } from '@shared/components/layout/main.layout';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '',
    children: [
      {
        path: 'login',
        loadComponent: () => import('@features/users/components/login/login').then(c => c.Login)
      },
      {
        path: 'register',
        loadComponent: () => import('@features/users/components/register/register').then(c => c.Register)
      }
    ]
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [roleGuard],
    children: [
      {
        path: 'home',
        loadComponent: () => import('@features/home/home').then(c => c.Home)
      },
      {
        path: 'users',
        loadComponent: () => import('@features/users/components/users/users').then(c => c.Users),
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN] }
      },
      {
        path: 'users/create',
        loadComponent: () => import('@features/users/components/formUser/form.user').then(c => c.FormUser),
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN] }
      },
      {
        path: 'users/edit/:userId',
        loadComponent: () => import('@features/users/components/formUser/form.user').then(c => c.FormUser),
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.STUDENT] }
      },

      {
        path: 'courses',
        loadChildren: () => import('@features/courses/courses.routes').then(r => r.courses_routes)
      },
      {
        path: 'grades',
        loadChildren: () => import('@features/grades/grades.routes').then(r => r.grades_routes)
      },
      {
        path: 'departments',
        loadChildren: () => import('@features/departments/departments.routes').then(r => r.departments_routes)
      },
      {
        path: 'schedules',
        loadChildren: () => import('@features/schedules/schedules.routes').then(r => r.schedules_routes)
      },
      {
        path: '**',
        loadComponent: () => import('@shared/components/not-found/not-found').then(c => c.NotFound)
      }
    ]
  },

];
