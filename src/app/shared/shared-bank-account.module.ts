import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'app/app-material/app-material.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { SharedBankAccountComponent } from './components/shared-bank-account/shared-bank-account.component';
import { BankAccountDialogComponent } from './components/shared-bank-account/bank-account-dialog/bank-account-dialog.component';
import { ApproveRejectDialogComponent } from './components/shared-bank-account/approve-reject-dialog/approve-reject-dialog.component';
import { SharedModule } from 'app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    NgxDatatableModule,
    SharedModule,
  ],
  declarations: [
    SharedBankAccountComponent,
    BankAccountDialogComponent,
    ApproveRejectDialogComponent,
  ],
  entryComponents:[
    BankAccountDialogComponent,
    ApproveRejectDialogComponent,
  ],
  exports: [
    SharedBankAccountComponent,
  ]
})
export class SharedBankAccountModule { }
