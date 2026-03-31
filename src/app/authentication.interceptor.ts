import { Injectable, Injector } from '@angular/core';
import {  HttpErrorResponse, 
          HttpResponse, 
          HttpEvent, 
          HttpHandler, 
          HttpInterceptor, 
          HttpRequest } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';

import { Observable } from 'rxjs';

import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { empty } from 'rxjs';

import { AuthService } from './auth/auth.service';

@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {

  constructor(
    public router:Router,     
    private injector: Injector
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    const authService = this.injector.get(AuthService);

    req = req.clone({ headers: req.headers.set('Authorization', 'Bearer ' + authService.getToken()) });
    
    req = req.clone({ headers: req.headers.set('X-CSRF-TOKEN', authService.getToken()) });

    if (!req.headers.has('Content-Type')) {
      // req = req.clone({ headers: req.headers.set('Content-Type', 'application/json') });
    }

    req = req.clone({ headers: req.headers.set('Accept', 'application/json') });

    const reqUrl = (req.url || '').toLowerCase();
    const reqBody: any = req.body || {};
    const hasPersonalInfo = reqBody && typeof reqBody === 'object' && !Array.isArray(reqBody) && !!reqBody.personalInfo;
    const isSaveRequest = reqUrl.indexOf('admission/saveform') !== -1 || reqUrl.indexOf('institute/saveadmissionform') !== -1;
    const shouldTraceNameChange = req.method === 'POST' && (isSaveRequest || hasPersonalInfo);

    if (shouldTraceNameChange) {
      const body: any = reqBody;
      const personalInfo: any = body.personalInfo || {};
      const isNameChangeFromAi = Number(
        body.is_name_change_from_ai !== undefined ? body.is_name_change_from_ai :
          (body.isNameChangeFromAi !== undefined ? body.isNameChangeFromAi :
            (personalInfo.is_name_change_from_ai !== undefined ? personalInfo.is_name_change_from_ai :
              (personalInfo.isNameChangeFromAi !== undefined ? personalInfo.isNameChangeFromAi : 0)))
      ) || 0;

      // Force field into request body for all save paths so payload always contains it.
      if (body && typeof body === 'object' && !Array.isArray(body)) {
        const mergedPersonalInfo = (personalInfo && typeof personalInfo === 'object' && !Array.isArray(personalInfo))
          ? Object.assign({}, personalInfo)
          : {};
        mergedPersonalInfo.isNameChangeFromAi = isNameChangeFromAi;
        mergedPersonalInfo.is_name_change_from_ai = isNameChangeFromAi;

        const mergedBody = Object.assign({}, body, {
          isNameChangeFromAi: isNameChangeFromAi,
          is_name_change_from_ai: isNameChangeFromAi,
          personalInfo: mergedPersonalInfo
        });

        req = req.clone({ body: mergedBody });
      }
    }

    return next.handle(req).pipe(map((event: HttpEvent<any>) => {

      if (event instanceof HttpResponse) {
        if (event.body.status == 419) {
          authService.sessionExpired();
        } else if (event.body.status == 500) {
          this.router.navigate(['/under-maintenance']);
        }
      }
      return event;
    })).pipe(catchError((event) => {
      if (event instanceof HttpErrorResponse) {
        return this.catch401(event);
      }
    }));
  }

  // Response Interceptor
  private catch401(error: HttpErrorResponse): Observable<any> {
    const authService = this.injector.get(AuthService);        
    // Check if we had 401 response
    if (error.status === 0) {
      // authService.internetConnectionError();
      // return empty();
    } else if (error.status === 401) {
      // redirect to Login page for example
      return empty();
    }
    return throwError(error);
  }
}