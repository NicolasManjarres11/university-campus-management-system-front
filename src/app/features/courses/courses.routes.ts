import { Routes } from "@angular/router";
import { roleGuard } from "@core/guards/role.guard";
import { UserRole } from "@features/users/models/user.model";

export const courses_routes: Routes = [
    {
        path: '',
        loadComponent: () => import('@features/courses/components/courses/courses').then(c => c.Courses)
    },
    {
        path: 'create',
        loadComponent: () => import('@features/courses/components/form-course/form-course').then(c => c.FormCourse),
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN, UserRole.PROFESSOR] }
    },
    {
        path: 'edit/:courseId',
        loadComponent: () => import('@features/courses/components/form-course/form-course').then(c => c.FormCourse),
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN, UserRole.PROFESSOR] }
    },
    {
        path: ':courseId',
        loadComponent: () => import('@features/courses/components/course-detail/course-detail').then(c => c.CourseDetail)
    }
]