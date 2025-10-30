import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'app/app-material/app-material.module';

import { AdmissionFormBComponent } from './admission-form-b.component';
import { SharedAdmissionFormModule } from 'app/shared/shared-admission-form.module';

const ROUTES: Routes = [
  {
    path: '',
    component: AdmissionFormBComponent
  }
]

@NgModule({
  imports: [
    AppMaterialModule,
    CommonModule,
	  RouterModule.forChild(ROUTES),
    FormsModule,
    ReactiveFormsModule,
    SharedAdmissionFormModule
  ],
  declarations: [
    AdmissionFormBComponent
  ]
})
export class AdmissionFormBModule { }
