import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'app/app-material/app-material.module';

import { CourseSelectionComponent } from './course-selection.component';
import { SharedCourseSelectionModule } from 'app/shared/shared-course-selection.module';

const ROUTES: Routes = [
  {
    path: '',
    component: CourseSelectionComponent
  }
]

@NgModule({
  imports: [
    AppMaterialModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
	  RouterModule.forChild(ROUTES),
    SharedCourseSelectionModule,
  ],
  declarations: [
    CourseSelectionComponent
  ]
})
export class CourseSelectionModule { }
