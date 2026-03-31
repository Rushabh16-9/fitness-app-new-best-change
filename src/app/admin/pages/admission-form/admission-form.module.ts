import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'app/app-material/app-material.module';

import { AdmissionFormComponent } from './admission-form.component';
import { SharedAdmissionFormModule } from 'app/shared/shared-admission-form.module';
import { SharedModule } from 'app/shared/shared.module';
import { AdmissionService } from 'app/shared/services/admission.service';
//import { ApplicationPreviewDialogComponent } from 'app-shared-components/application-preview-dialog/application-preview.component';

const ROUTES: Routes = [
  {
    path: '',
    component: AdmissionFormComponent
  }
]

@NgModule({
  imports: [
    AppMaterialModule,
    CommonModule,
    RouterModule.forChild(ROUTES),
    FormsModule,
    ReactiveFormsModule,
    SharedAdmissionFormModule,
    SharedModule
  ],
  declarations: [
    AdmissionFormComponent
    //  ApplicationPreviewDialogComponent

  ],
  providers: [
    AdmissionService
  ]
})
export class AdmissionFormModule { }
