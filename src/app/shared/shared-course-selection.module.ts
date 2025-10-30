import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'app/app-material/app-material.module';

import { SharedCourseSelectionComponent } from './components/shared-course-selection/shared-course-selection.component';
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
    SharedCourseSelectionComponent,
  ],
  exports: [
    SharedCourseSelectionComponent,
  ]
})
export class SharedCourseSelectionModule { }
