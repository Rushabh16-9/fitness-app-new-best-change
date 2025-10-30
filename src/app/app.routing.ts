import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules  } from '@angular/router'; 

import { AuthGuard } from './auth/auth.guard';
import { AdminLayoutComponent } from './admin/admin-layout.component';

export const routes: Routes = [
  {
    path: '', 
    component: AdminLayoutComponent, children: [
      {
        path: '',
        redirectTo: '/admissionForm',
        pathMatch: 'full'
      },
      {
        path: 'admissionForm', 
        loadChildren: () => import('./admin/pages/admission-form/admission-form.module').then(m => m.AdmissionFormModule),
        data: { breadcrumb: 'Admission Form' },
        canActivate: [AuthGuard]
      },
      {
        path: 'admissionFormB', 
        loadChildren: () => import('./admin/pages/admission-form-b/admission-form-b.module').then(m => m.AdmissionFormBModule),
        data: { breadcrumb: 'Form B' },
        canActivate: [AuthGuard]
      },
      {
        path: 'atktForm', 
        loadChildren: () => import('./admin/pages/atkt-form/atkt-form.module').then(m => m.AtktFormModule),
        data: { breadcrumb: 'ATKT Forms' },
        canActivate: [AuthGuard]
      },
      {
        path: 'examForm', 
        loadChildren: () => import('./admin/pages/atkt-form/atkt-form.module').then(m => m.AtktFormModule),
        data: { breadcrumb: 'ATKT Forms' },
        canActivate: [AuthGuard]
      },
      {
        path: 'uploadDocuments', 
        loadChildren: () => import('./admin/pages/upload-documents/upload-documents.module').then(m => m.UploadDocumentsModule),
        data: { breadcrumb: 'Upload Documents' },
        canActivate: [AuthGuard]
      },
      {
        path: 'courseSelection', 
        loadChildren: () => import('./admin/pages/course-selection/course-selection.module').then(m => m.CourseSelectionModule),
        data: { breadcrumb: 'Course Selection' },
        canActivate: [AuthGuard]
      },
      {
        path: 'cart', 
        loadChildren: () => import('./admin/pages/cart/cart.module').then(m => m.CartModule),
        data: { breadcrumb: 'Cart' },
        canActivate: [AuthGuard]
      },
      {
        path: 'paymentHistory', 
        loadChildren: () => import('./admin/pages/payment-history/payment-history.module').then(m => m.PaymentHistoryModule),
        data: { breadcrumb: 'Payment History' },
        canActivate: [AuthGuard]
      },
      {
        path: 'downloadForms', 
        loadChildren: () => import('./admin/pages/download-forms/download-forms.module').then(m => m.DownloadFormsModule),
        data: { breadcrumb: 'Download Forms' },
        canActivate: [AuthGuard]
      },
      {
        path: 'scheduleInterview', 
        loadChildren: () => import('./admin/pages/schedule-interview/schedule-interview.module').then(m => m.ScheduleInterviewModule),
        data: { breadcrumb: 'Schedule Interview' },
        canActivate: [AuthGuard]
      }
    ]
  },
  { 
    path: 'openAdmissionForm', 
    loadChildren: () => import('./open-admission-form/open-admission-form.module').then(m => m.OpenAdmissionFormModule),    
  },
  {
    path: 'browser-error', 
    loadChildren: () => import('./browser-error/browser-error.module').then(m => m.BrowserErrorModule)
  },
  {
    path: 'login', 
    loadChildren: () => import('./login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'admissionLogin', 
    loadChildren: () => import('./login/admission/login.module').then(m => m.AdmissionLoginModule)
  },
  {
    path: 'masterLogin', 
    loadChildren: () => import('./master-login/master-login.module').then(m => m.MasterLoginModule)
  },
  {
    path: 'logout', 
    loadChildren: () => import('./logout/logout.module').then(m => m.LogoutModule)
  },
  {
    path: 'payment-result', 
    loadChildren: () => import('./payment-result/payment-result.module').then(m => m.PaymentResultModule),
    canActivate: [AuthGuard]
  },
  {   
    path: 'enquiryForm', 
    loadChildren: () => import('./enquiry-form/enquiry-form.module').then(m => m.EnquiryFormModule)
  },
  {
    path: '404', 
    loadChildren: () => import('./page-not-found/page-not-found.module').then(m => m.PageNotFoundModule)        
  },
  {
    path: 'no-access', 
    loadChildren: () => import('./no-access/no-access.module').then(m => m.NoAccessModule)        
  },
  {
    path: 'under-maintenance', 
    loadChildren: () => import('./under-maintenance/under-maintenance.module').then(m => m.UnderMaintenanceModule)        
  },
  {
    path: '**', 
    redirectTo: '/404'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled'
})
  ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }