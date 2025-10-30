import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'app/app-material/app-material.module';

import { AppCartComponent } from './components/app-cart/app-cart.component';
import { SharedModule } from 'app/shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        AppMaterialModule,
        SharedModule,
    ],
    declarations: [
        AppCartComponent,
    ],
    exports: [
        AppCartComponent,
    ]
})
export class SharedCartModule { }
