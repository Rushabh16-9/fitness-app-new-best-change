import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from '../../../app-material/app-material.module';

import { UploadDocumentsComponent } from './upload-documents.component';
import { SharedModule } from 'app/shared/shared.module';

const ROUTES: Routes = [
  {
    path: '',
    component: UploadDocumentsComponent
  }
]

@NgModule({
  imports: [
    AppMaterialModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
	  RouterModule.forChild(ROUTES),
    SharedModule
  ],
  declarations: [UploadDocumentsComponent]
})
export class UploadDocumentsModule { }
