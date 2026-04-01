import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

import { SnackBarMsgComponent } from 'app-shared-components/snack-bar-msg/snack-bar-msg.component';
import { PaymentService } from 'app-shared-services/payment.service';

import { AllEventEmitters } from 'app/global/all-event-emitters';

import * as globalFunctions from 'app/global/globalFunctions';
import * as allMsgs from 'app/global/allMsgs';

@Component({
  selector: 'documents-dialog',
  templateUrl: './documents-dialog.component.html',
  styleUrls: ['./documents-dialog.component.css'],
  providers: [SnackBarMsgComponent, PaymentService],
  encapsulation: ViewEncapsulation.None  
})
export class DocumentsDialogComponent implements OnInit {

  mode: string;
  modalTitle: string;

  constructor(
    public _snackBarMsgComponent: SnackBarMsgComponent,
    private _paymentService: PaymentService,
    private allEventEmitters: AllEventEmitters,    
    @Inject(MAT_DIALOG_DATA) public documentsArray: any
  ) { }

  ngOnInit() {
    this._snackBarMsgComponent.closeSnackBar();
  }

  getDocumentUrl(documentUrl) {
    if (!globalFunctions.isEmpty(documentUrl)) {
      let resolvedUrl = documentUrl;
      // Resolve relative file names to full URLs
      if (documentUrl && !/^https?:\/\//i.test(documentUrl) && documentUrl.indexOf('/') === -1 && documentUrl.indexOf('\\') === -1) {
        resolvedUrl = `http://localhost:3000/uploads/${documentUrl}`;
      }
      var win = window.open(resolvedUrl, '_blank');
      if (win) {
        win.focus();
      } else {
        alert('Please allow popups for this website');
      }          
    } else {
      alert('Document URL not found!');
    }
  }  

}
