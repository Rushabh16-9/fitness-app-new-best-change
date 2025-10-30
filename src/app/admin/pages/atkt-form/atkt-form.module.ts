import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from '../../../app-material/app-material.module';

import { AtktFormComponent } from './atkt-form.component';
import { SharedAtktFormModule } from 'app/shared/shared-atkt-form.module';

const ROUTES: Routes = [
  {
    path: '',
    component: AtktFormComponent
  }
]

@NgModule({
  imports: [
    AppMaterialModule,
    CommonModule,
	  RouterModule.forChild(ROUTES),
    FormsModule,
    ReactiveFormsModule,
    SharedAtktFormModule,
  ],
  declarations: [
    AtktFormComponent
  ]
})
export class AtktFormModule { }
