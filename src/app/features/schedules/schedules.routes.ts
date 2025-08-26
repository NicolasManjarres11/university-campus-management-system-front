import { Routes } from "@angular/router";
import { roleGuard } from "@core/guards/role.guard";
import { UserRole } from "@features/users/models/user.model";

export const schedules_routes: Routes = [
    {
        path: '',
        loadComponent: () => import('@features/schedules/components/schedules/schedules').then(c => c.Schedules)
    },
    {
        path: 'create',
        loadComponent: () => import('@features/schedules/components/form-schedule/form-schedule').then(c => c.FormSchedule),
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN, UserRole.PROFESSOR] }
    },
    {
        path: 'edit/:scheduleId',
        loadComponent: () => import('@features/schedules/components/form-schedule/form-schedule').then(c => c.FormSchedule),
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN, UserRole.PROFESSOR] }
    },
    {
        path: ':scheduleId',
        loadComponent: () => import('@features/schedules/components/schedule-detail/schedule-detail').then(c => c.ScheduleDetail)
    }
]