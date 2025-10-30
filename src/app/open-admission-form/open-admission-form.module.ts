import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'app/app-material/app-material.module';

import { OpenAdmissionFormComponent } from './open-admission-form.component';
import { SharedModule } from 'app/shared/shared.module';
import { SharedAdmissionFormModule } from 'app/shared/shared-admission-form.module';

const ROUTES: Routes = [
  {
    path: '',
    component: OpenAdmissionFormComponent
  }
]

@NgModule({
  imports: [
    AppMaterialModule,
    CommonModule,
	  RouterModule.forChild(ROUTES),
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    SharedAdmissionFormModule
  ],
  declarations: [
    OpenAdmissionFormComponent
  ]
})
export class OpenAdmissionFormModule { }
