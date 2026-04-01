import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

import { SnackBarMsgComponent } from 'app-shared-components/snack-bar-msg/snack-bar-msg.component';
import { PaymentService } from 'app-shared-services/payment.service';

import { AllEventEmitters } from 'app/global/all-event-emitters';

import * as globalFunctions from 'app/global/globalFunctions';
import * as allMsgs from 'app/global/allMsgs';

@Component({
  selector: 'receipts-dialog',
  templateUrl: './receipts-dialog.component.html',
  styleUrls: ['./receipts-dialog.component.css'],
  providers: [SnackBarMsgComponent, PaymentService],
  encapsulation: ViewEncapsulation.None  
})
export class ReceiptsDialogComponent implements OnInit {

  mode: string;
  modalTitle: string;
  showFormsDownload:boolean = false;

  constructor(
    public _snackBarMsgComponent: SnackBarMsgComponent,
    private _paymentService: PaymentService,
    private allEventEmitters: AllEventEmitters,    
    @Inject(MAT_DIALOG_DATA) public receiptsArray: any,
    @Inject(MAT_DIALOG_DATA) public formUrlsArray: any,
    @Inject(MAT_DIALOG_DATA) public showForms: any,
  ) { }

  ngOnInit() {
    this._snackBarMsgComponent.closeSnackBar();
    if (!globalFunctions.isEmpty(this.formUrlsArray)) {
      this.showFormsDownload = true;
    }
  }

  downloadForm(formUrl) {
    let resolvedUrl = formUrl;
    // Resolve relative file names to full URLs
    if (formUrl && !/^https?:\/\//i.test(formUrl) && formUrl.indexOf('/') === -1 && formUrl.indexOf('\\') === -1) {
      resolvedUrl = `http://localhost:3000/uploads/${formUrl}`;
    }
    var win = window.open(resolvedUrl, '_blank');
    if (win) {
      win.focus();
    } else {
      alert('Please allow popups for this website');
    }
  }
  
  downloadReceipt(receiptUrl) {
    let resolvedUrl = receiptUrl;
    // Resolve relative file names to full URLs
    if (receiptUrl && !/^https?:\/\//i.test(receiptUrl) && receiptUrl.indexOf('/') === -1 && receiptUrl.indexOf('\\') === -1) {
      resolvedUrl = `http://localhost:3000/uploads/${receiptUrl}`;
    }
    var win = window.open(resolvedUrl, '_blank');
    if (win) {
      win.focus();
    } else {
      alert('Please allow popups for this website');
    }
  }

  getReceiptUrl(receiptId) {

    this.allEventEmitters.showLoader.emit(true);
    this._paymentService.getReceiptUrl(receiptId).subscribe(data => {
    
      this.allEventEmitters.showLoader.emit(false);
    
      if (data.status != undefined) {
        if (data.status == 1) {
          let resolvedUrl = data.dataJson.receiptUrl;
          // Resolve relative file names to full URLs
          if (data.dataJson.receiptUrl && !/^https?:\/\//i.test(data.dataJson.receiptUrl) && data.dataJson.receiptUrl.indexOf('/') === -1 && data.dataJson.receiptUrl.indexOf('\\') === -1) {
            resolvedUrl = `http://localhost:3000/uploads/${data.dataJson.receiptUrl}`;
          }
          var win = window.open(resolvedUrl, '_blank');
          if (win) {
            win.focus();
          } else {
            alert('Please allow popups for this website');
          }
        } else if (data.status == 0) {
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar');
        }
      } else {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar');
      }
    }, err => {
      this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar');
    });
  }

}
