import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'app/app-material/app-material.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { SharedCourseCreationComponent } from './components/shared-course-creation/shared-course-creation.component';
import { CourseCreationDialogComponent } from './components/shared-course-creation/course-creation-dialog/course-creation-dialog.component';
import { GroupSubjectsDialogComponent } from './components/shared-course-creation/group-subjects-dialog/group-subjects-dialog.component';
import { ExamTermDialogComponent } from './components/shared-course-creation/exam-term-dialog/exam-term-dialog.component';
import { CreateTermDialogComponent } from './components/shared-course-creation/exam-term-dialog/create-term-dialog/create-term-dialog.component';
import { CreateGroupSubjectsDialogComponent } from './components/shared-course-creation/group-subjects-dialog/create-group-subjects-dialog/create-group-subjects-dialog.component';
import { CreateLanguageGroupsDialogComponent } from './components/shared-course-creation/group-subjects-dialog/create-language-groups-dialog/create-language-groups-dialog.component';

import { SharedModule } from 'app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    NgxDatatableModule,
    SharedModule,
  ],
  declarations: [
    SharedCourseCreationComponent,
    CourseCreationDialogComponent,
    GroupSubjectsDialogComponent,
    ExamTermDialogComponent,
    CreateTermDialogComponent,
    CreateGroupSubjectsDialogComponent,
    CreateLanguageGroupsDialogComponent,
  ],
  entryComponents:[
    CourseCreationDialogComponent,
    GroupSubjectsDialogComponent,
    ExamTermDialogComponent,
    CreateTermDialogComponent,
    CreateGroupSubjectsDialogComponent,
    CreateLanguageGroupsDialogComponent,
  ],
  exports: [
    SharedCourseCreationComponent,
  ]
})
export class SharedCourseCreationModule { }
