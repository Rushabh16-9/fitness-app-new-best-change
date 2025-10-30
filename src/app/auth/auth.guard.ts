import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {

    if (!this.authService.isUserLoggedIn()) {
      // this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
      this.router.navigate(['/login']);
      return false;
    }

    // var aclRoutes = this.authService.getAclRoutes();

    // if (aclRoutes.indexOf(window.location.pathname) < 0) {
    //   this.router.navigate(['/login']);
    // }

    return true;
  }
}
