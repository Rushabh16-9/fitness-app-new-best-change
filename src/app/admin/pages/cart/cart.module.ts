import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppMaterialModule } from 'app/app-material/app-material.module';

import { CartComponent } from './cart.component';
import { SharedCartModule } from 'app/shared/shared-cart.module';

const ROUTES: Routes = [
  {
    path: '',
    component: CartComponent
  }
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ROUTES),
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    SharedCartModule,
  ],
  declarations: [CartComponent]
})
export class CartModule { }
