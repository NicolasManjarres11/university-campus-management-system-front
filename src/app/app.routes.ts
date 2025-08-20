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
        loadComponent: () => import('@features/users/components/create.user/form.user').then(c => c.FormUser),
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN] }
      },
      {
        path: 'users/edit/:userId',
        loadComponent: () => import('@features/users/components/create.user/form.user').then(c => c.FormUser),
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN] }
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
    ]
  },
 

/*     { path: '', pathMatch: 'full', redirectTo: 'courses' }, */

/*     // Login público (solo invitados)
    {
      path: 'login',
      // Ajusta al componente real que uses de login
      loadComponent: () => import('@features/users/components/login/login.component')
        .then(m => m.LoginComponent),
      canMatch: [guestOnlyGuard]
    },
  
    // Users (solo Admin)
    {
      path: 'users',
      loadChildren: () => import('@features/users/users.routes').then(r => r.routes),
      canMatch: [roleGuard],
      data: { roles: [UserRole.ADMIN] }
    },
  
    // Courses (todos los roles)
    {
      path: 'courses',
      loadChildren: () => import('@features/courses/courses.routes').then(r => r.routes),
      canMatch: [roleGuard],
      data: { roles: [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.STUDENT] }
    },
  
    // Departments (solo Admin)
    {
      path: 'departments',
      loadChildren: () => import('@features/departments/departments.routes').then(r => r.routes),
      canMatch: [roleGuard],
      data: { roles: [UserRole.ADMIN] }
    },
  
    // Schedules (todos los roles)
    {
      path: 'schedules',
      loadChildren: () => import('@features/schedules/schedules.routes').then(r => r.routes),
      canMatch: [roleGuard],
      data: { roles: [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.STUDENT] }
    },
  
    // Grades (todos los roles; la restricción fina va en el servicio/UI)
    {
      path: 'grades',
      loadChildren: () => import('@features/grades/grades.routes').then(r => r.routes),
      canMatch: [roleGuard],
      data: { roles: [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.STUDENT] }
    },
  
    { path: '**', redirectTo: '' } */

    

];
