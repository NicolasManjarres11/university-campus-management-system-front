import { Routes } from '@angular/router';

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
    path: 'courses',
    loadChildren: () => import('@features/courses/courses.routes').then(r => r.courses_routes)
  }

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
