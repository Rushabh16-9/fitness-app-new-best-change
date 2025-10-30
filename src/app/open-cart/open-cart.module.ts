import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'app/app-material/app-material.module';

import { OpenCartComponent } from './open-cart.component';
import { SharedCartModule } from 'app/shared/shared-cart.module';

export const routes = [
  { path: '', component: OpenCartComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [
    CommonModule,
	  RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    SharedCartModule,    
  ],
  declarations: [
    OpenCartComponent
  ]
})
export class OpenCartModule { }
