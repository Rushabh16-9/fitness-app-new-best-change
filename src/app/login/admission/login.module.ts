import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'app/app-material/app-material.module';
	
import { LoginComponent } from './login.component';
import { SharedCartModule } from 'app/shared/shared-cart.module';

export const routes = [
  { path: '', component: LoginComponent }
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
    LoginComponent,
  ]
})
export class AdmissionLoginModule {}
