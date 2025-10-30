import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'app/app-material/app-material.module';
	
import { UnderMaintenanceComponent } from './under-maintenance.component';

export const routes: Routes = [
  { path: '', component: UnderMaintenanceComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [
  	CommonModule,
  	RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
  ],
  declarations: [
    UnderMaintenanceComponent
  ]
})
export class UnderMaintenanceModule {}
