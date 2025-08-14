import { Routes } from '@angular/router';
import { roleGuard } from '@core/guards/role.guard';
import { MainLayout } from '@shared/components/layout/main.layout';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '',
    loadChildren: () => import('@features/users/users.routes').then(r => r.users_routes)
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
