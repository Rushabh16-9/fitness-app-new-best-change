import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'app/app-material/app-material.module';

import { SharedAtktFormComponent } from './components/shared-atkt-form/shared-atkt-form.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        AppMaterialModule,
    ],
    declarations: [
        SharedAtktFormComponent,
    ],
    exports: [
        SharedAtktFormComponent
    ]
})
export class SharedAtktFormModule { }
