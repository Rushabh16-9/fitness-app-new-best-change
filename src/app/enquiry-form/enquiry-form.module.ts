import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'app/app-material/app-material.module';
import { EnquiryFormComponent } from './enquiry-form.component';

export const routes: Routes = [
  { path: '', component: EnquiryFormComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [
  	CommonModule,
  	RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
  ],
  declarations: [EnquiryFormComponent]
})
export class EnquiryFormModule {}
