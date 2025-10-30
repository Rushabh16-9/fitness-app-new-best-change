import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

import { AppRoutingModule } from './app.routing';

import { OverlayContainer } from '@angular/cdk/overlay';
import { CustomOverlayContainer } from './theme/utils/custom-overlay-container';

import { AppComponent } from './app.component';
import { AppMaterialModule } from './app-material/app-material.module';

import { AdminLayoutComponent } from './admin/admin-layout.component';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  wheelPropagation: true,
  suppressScrollX: true               
};

import { AuthService } from './auth/auth.service';
import { AuthGuard } from './auth/auth.guard';
import { AuthenticationInterceptor } from './authentication.interceptor';
import { AllEventEmitters } from './global/all-event-emitters';
import { AppSettings } from './app.settings';

import { PipesModule } from './theme/pipes/pipes.module';
import { MenuItemComponent } from './theme/components/menu/menu-item/menu-item.component';
import { SidenavComponent } from './theme/components/sidenav/sidenav.component';
import { VerticalMenuComponent } from './theme/components/menu/vertical-menu/vertical-menu.component';
import { HorizontalMenuComponent } from './theme/components/menu/horizontal-menu/horizontal-menu.component';
import { BreadcrumbComponent } from './theme/components/breadcrumb/breadcrumb.component';
import { FullScreenComponent } from './theme/components/fullscreen/fullscreen.component';
import { MultipleUsersComponent } from './theme/components/multiple-users/multiple-users.component';
import { UserMenuComponent } from './theme/components/user-menu/user-menu.component';

import { SnackBarMsgComponent } from './shared/components/snack-bar-msg/snack-bar-msg.component';
import { ImageCropperDialogComponent } from './shared/components/image-cropper-dialog/image-cropper-dialog.component';

import { ImageCropperModule } from 'ngx-image-cropper';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { AmazingTimePickerModule } from 'amazing-time-picker';

import { ChangeCourseDialogComponent } from 'app-shared-components/change-course-dialog/change-course-dialog.component';

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        PerfectScrollbarModule,
        AppMaterialModule,
        HttpClientModule,
        HttpClientXsrfModule,
        ImageCropperModule,
        NgxDatatableModule,
        PipesModule,
        AppRoutingModule,
        AmazingTimePickerModule
    ],
    declarations: [
        AppComponent,
        AdminLayoutComponent,
        SidenavComponent,
        VerticalMenuComponent,
        HorizontalMenuComponent,
        BreadcrumbComponent,
        FullScreenComponent,
        MultipleUsersComponent,
        UserMenuComponent,
        SnackBarMsgComponent,
        ImageCropperDialogComponent,
        MenuItemComponent,
        ChangeCourseDialogComponent,
    ],
    providers: [
        AppSettings,
        SnackBarMsgComponent,
        Title,
        AuthService,
        AuthGuard,
        AllEventEmitters,
        {
            provide: PERFECT_SCROLLBAR_CONFIG,
            useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
        },
        {
            provide: MAT_DIALOG_DATA,
            useValue: {}
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthenticationInterceptor,
            multi: true,
        },
        { provide: OverlayContainer, useClass: CustomOverlayContainer }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
