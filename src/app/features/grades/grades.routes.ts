import { Routes } from "@angular/router";
import { roleGuard } from "@core/guards/role.guard";
import { UserRole } from "@features/users/models/user.model";

export const grades_routes: Routes = [
    {
        path: '',
        loadComponent: () => import('@features/grades/components/grades/grades').then(c => c.Grades)
    },
    {
        path: 'create',
        loadComponent: () => import('@features/grades/components/form-grade/form-grade').then(c => c.FormGrade),
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN, UserRole.PROFESSOR] }
    },
    {
        path: 'edit/:gradeId',
        loadComponent: () => import('@features/grades/components/form-grade/form-grade').then(c => c.FormGrade),
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN, UserRole.PROFESSOR] }
    },
    {
        path: ':gradeId',
        loadComponent: () => import('@features/grades/components/grade-detail/grade-detail').then(c => c.GradeDetail)
    }
]