import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router
} from '@angular/router';

import {
  AuthService,
  UserRole
} from '../services/auth.service';

export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles =
    route.data['roles'] as UserRole[] | undefined;

  if (!allowedRoles?.length) {
    return true;
  }

  const user = authService.getUser();

  if (
    user &&
    allowedRoles.includes(user.role)
  ) {
    return true;
  }

  if (user?.role === 'instructor') {
    return router.createUrlTree([
      '/instructor/dashboard'
    ]);
  }

  return router.createUrlTree([
    '/student/dashboard'
  ]);
};