import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, CanMatchFn, Route, Router } from "@angular/router";
import { AuthService } from "@core/services";
import { UserRole } from "@features/users/models/user.model";

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {

    const auth = inject(AuthService);
    const router = inject(Router);



    //Validamos si inició sesión
    if(!auth.isLoggedIn()){
        return router.createUrlTree(['/login']);
    }

    const currentUser = auth.user();
    const userId = route.paramMap.get('userId')

    if(route.routeConfig?.path?.includes('edit/:userId') && userId){
        if(currentUser?.role === UserRole.ADMIN){
            return true;
        }
        if(currentUser?.id === userId){
            return true;
        }

        return router.createUrlTree(['/users/edit', currentUser?.id])
    }

    //Si la ruta no define roles, pasa
    const allowed = (route.data?.['roles'] as UserRole[] | undefined) ?? [];
    
    
    if(allowed.length === 0) return true; 

    const userRole = auth.userRole();
    
    const hasAccess = allowed.includes(userRole as UserRole);
    
    return hasAccess ? true : router.createUrlTree(['/home']);
}