import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'app/app-material/app-material.module';

import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { InfoDialogComponent } from './components/info-dialog/info-dialog.component';
import { DocumentsDialogComponent } from './components/documents-dialog/documents-dialog.component';
import { SearchBlockComponent } from 'app-shared-components/search-block/search-block.component';
import { UtrDialogComponent } from './components/utr-dialog/utr-dialog.component';
import { ReceiptsDialogComponent } from './components/receipts-dialog/receipts-dialog.component';
import { SubjectsInfoDialogComponent } from './components/subjects-info-dialog/subjects-info-dialog.component';
import { DocumentUploadDialogComponent } from './components/document-upload-dialog/document-upload-dialog.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        AppMaterialModule,
    ],
    declarations: [
        ConfirmDialogComponent,
        InfoDialogComponent,
        DocumentsDialogComponent,
        SearchBlockComponent,
        UtrDialogComponent,
        ReceiptsDialogComponent,
        SubjectsInfoDialogComponent,
        DocumentUploadDialogComponent,
    ],
    exports: [
        SearchBlockComponent,
        DocumentUploadDialogComponent,
    ]
})
export class SharedModule { }
