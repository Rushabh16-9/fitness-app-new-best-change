import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'app/app-material/app-material.module';

import { PayFeesComponent } from './components/pay-fees/pay-fees.component';
import { SharedCartModule } from 'app/shared/shared-cart.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    SharedCartModule,
  ],
  declarations: [
    PayFeesComponent,
  ],
  entryComponents:[
  ],
  exports: [
    PayFeesComponent,
  ]
})
export class PayFeesModule { }
