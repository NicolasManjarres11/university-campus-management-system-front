import { Routes } from "@angular/router";
import { roleGuard } from "@core/guards/role.guard";
import { UserRole } from "@features/users/models/user.model";

export const departments_routes: Routes = [
    {
        path: '',
        loadComponent: () => import('@features/departments/components/departments/departments').then(c => c.Departments)
    },
    {
        path: 'create',
        loadComponent: () => import('@features/departments/components/form-department/form-department').then(c => c.FormDepartment),
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN] }
    },
    {
        path: 'edit/:departmentId',
        loadComponent: () => import('@features/departments/components/form-department/form-department').then(c => c.FormDepartment),
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN] }
    },
    {
        path: ':departmentId',
        loadComponent: () => import('@features/departments/components/department-detail/department-detail').then(c => c.DepartmentDetail)
    }
]