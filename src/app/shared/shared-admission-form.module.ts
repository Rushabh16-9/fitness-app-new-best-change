import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'app/app-material/app-material.module';

import { SharedAdmissionFormComponent } from './components/shared-admission-form/shared-admission-form.component';
import { SharedCourseSelectionModule } from 'app/shared/shared-course-selection.module';

import { SharedModule } from 'app/shared/shared.module';
import { ApplicationPreviewDialogComponent } from 'app-shared-components/application-preview-dialog/application-preview.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        AppMaterialModule,
        SharedModule,
        SharedCourseSelectionModule,
    ],
    declarations: [
        SharedAdmissionFormComponent,
        ApplicationPreviewDialogComponent
    ],
    exports: [
        SharedAdmissionFormComponent
    ]
})
export class SharedAdmissionFormModule { }
