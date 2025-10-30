import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'app/app-material/app-material.module';

import { RegisterComponent } from './register.component';

export const routes = [
  { path: '', component: RegisterComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [
  	CommonModule,
  	RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
  ],
  declarations: [RegisterComponent]
})
export class RegisterModule {}
