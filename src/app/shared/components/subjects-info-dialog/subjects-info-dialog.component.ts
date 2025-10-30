import { Component, OnInit, ViewEncapsulation, ViewChild, Inject } from '@angular/core';

import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

import { SnackBarMsgComponent } from 'app-shared-components/snack-bar-msg/snack-bar-msg.component';
import { AllEventEmitters } from 'app/global/all-event-emitters';

import * as allMsgs from 'app/global/allMsgs';
import * as globalFunctions from 'app/global/globalFunctions';

@Component({
  selector: 'subjects-info-dialog',
  templateUrl: './subjects-info-dialog.component.html',
  styleUrls: ['./subjects-info-dialog.component.css'],
  providers: [
    SnackBarMsgComponent,
  ],
  encapsulation: ViewEncapsulation.None
})
export class SubjectsInfoDialogComponent implements OnInit {

  allMsgs: any = allMsgs;
  globalFunctions: any = globalFunctions;
  modalTitle: string;

  subjectList = [];

  constructor(
    public _snackBarMsgComponent: SnackBarMsgComponent,
    private allEventEmitters: AllEventEmitters, 
    @Inject(MAT_DIALOG_DATA) public subGrp: any,
    @Inject(MAT_DIALOG_DATA) public dialogRef: any
  ) {

  }

  ngOnInit() {

    this.subjectList = this.subGrp.subjectList;
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }
}
