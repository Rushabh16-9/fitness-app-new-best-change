import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'app/app-material/app-material.module';
	
import { PageNotFoundComponent } from './page-not-found.component';

export const routes: Routes = [
  { path: '', component: PageNotFoundComponent, pathMatch: 'full' }
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
    PageNotFoundComponent
  ]
})
export class PageNotFoundModule {}
