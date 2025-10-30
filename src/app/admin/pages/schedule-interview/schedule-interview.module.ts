import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { AppMaterialModule } from 'app/app-material/app-material.module';

import { ScheduleInterviewComponent } from './schedule-interview.component';
import { SlotsDialogComponent } from './slots-dialog/slots-dialog.component';

import { SharedModule } from 'app/shared/shared.module';

const ROUTES: Routes = [
  {
    path: '',
    component: ScheduleInterviewComponent
  }
]

@NgModule({
    imports: [
        CommonModule,
        AppMaterialModule,
        NgxDatatableModule,
        ReactiveFormsModule,
        FormsModule,
        SharedModule,
        RouterModule.forChild(ROUTES)
    ],
    declarations: [
        ScheduleInterviewComponent,
        SlotsDialogComponent,
    ]
})
export class ScheduleInterviewModule { }
