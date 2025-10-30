import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { AppMaterialModule } from 'app/app-material/app-material.module';

import { PaymentHistoryComponent } from './payment-history.component';

const ROUTES: Routes = [
  {
    path: '',
    component: PaymentHistoryComponent
  }
]

@NgModule({
  imports: [
    CommonModule,
    AppMaterialModule,
    NgxDatatableModule,    
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(ROUTES)    
  ],
  declarations: [PaymentHistoryComponent]
})
export class PaymentHistoryModule { }
