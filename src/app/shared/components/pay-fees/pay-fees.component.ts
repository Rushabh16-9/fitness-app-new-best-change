import { Component, ViewEncapsulation, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';

import { ReceiptsDialogComponent } from 'app-shared-components/receipts-dialog/receipts-dialog.component';

import { SnackBarMsgComponent } from 'app-shared-components/snack-bar-msg/snack-bar-msg.component';

import { StudentService } from 'app-shared-services/student.service';
import { PaymentService } from 'app-shared-services/payment.service';
import { InstitutesService } from 'app-shared-services/institutes.service';

import * as globalFunctions from 'app/global/globalFunctions';
import * as allMsgs from 'app/global/allMsgs';

import { AppSettings } from 'app/app.settings';
import { Settings } from 'app/app.settings.model';

import { AllEventEmitters } from 'app/global/all-event-emitters';

@Component({
  selector: 'pay-fees',
  templateUrl: './pay-fees.component.html',
  styleUrls: ['./pay-fees.component.css'],
  providers: [
    SnackBarMsgComponent, 
    PaymentService, 
    InstitutesService, 
    StudentService
  ],  
  encapsulation: ViewEncapsulation.None
})
export class PayFeesComponent implements OnInit {

  @Input('panelMode') panelMode;
  @Input('studentId') studentId;
  @Input('page') page;
  @Input('formType') formType;
  @Input('paymentOption') paymentOption;
  @Input('dialogRef') dialogRef;

  public settings: Settings;

  globalFunctions: any = globalFunctions;

  allSelected: boolean = false;
  showFeesEmptyMsg: boolean = true;
  showFeesBlock: boolean = false;
  showCartPage: boolean = false;
  noPendingFeesMsg: string = 'Not found any outstanding fees';
  noPaidFeesMsg: string = 'Not found any paid fees';

  cartCount: number = 0;
  feesCount: number = 0;
  totalPayableAmount: number = 0;

  admissionInvoices = [];
  totalFees = [];
  miscInvoices = [];
  feesArray = [];

  showNoticesBlock: boolean = false;
  noticesArray = [];

  constructor(
    public appSettings:AppSettings, 
    private router: Router,
    private activatedRoute: ActivatedRoute,    
    public dialog: MatDialog,     
    private allEventEmitters: AllEventEmitters,
    public _snackBarMsgComponent: SnackBarMsgComponent, 
    private _paymentService: PaymentService,
    private _institutesService: InstitutesService, 
    private _studentService: StudentService,
  ) {

    this.settings = this.appSettings.settings;

    this._snackBarMsgComponent.closeSnackBar();    
  }

  ngOnInit() {

    if (this.panelMode == 'pendingFees') {
      if (this.page == 'collectFees') {
        this.getStudentFeesDetails();
      } else {
        let localPeF = globalFunctions.getLocalStorage('localPeF', 'JsonParse');
        let localMiscF = globalFunctions.getLocalStorage('localMiscF', 'JsonParse');        
        let localAdmInvoices = globalFunctions.getLocalStorage('localAdmInvoices', 'JsonParse');
        if (!globalFunctions.isEmpty(localPeF) || !globalFunctions.isEmpty(localMiscF) || !globalFunctions.isEmpty(localAdmInvoices)) {
          this.checkLocalValues();
        } else {
          this.getFeesDetails();
        }
      }
    } else if (this.panelMode == 'paidFees') {
      let localPaF = globalFunctions.getLocalStorage('localPaF', 'JsonParse');
      if (!globalFunctions.isEmpty(localPaF)) {
        this.checkLocalValues();
      } else {
        this.getFeesDetails();
      }
    }
  }

  ngAfterViewInit() {
    let openCart = globalFunctions.getLocalStorage('openCart', 'JsonParse');
    if (!globalFunctions.isEmpty(openCart)) {
      this.settings.loadingSpinner = true;
    } else {
      setTimeout(() => { this.settings.loadingSpinner = false }, 300);      
    }
  }

  getStudentFeesDetails() {

    setTimeout(() => { this.allEventEmitters.showLoader.emit(true); }, 1);
    this._institutesService.getStudentFeesDetails(this.studentId).subscribe(data => {

      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);

      if (data.status != undefined) {
        if (data.status == 1) {
          this.totalFees = data.dataJson.mainInvoices;
          this.miscInvoices = data.dataJson.miscInvoices;
          this.admissionInvoices = data.dataJson.admissionInvoices;          
          this.createTotalFeesArray();
        } else if (data.status == 0) {
          this.showFeesBlock = false;
          this.showFeesEmptyMsg = true;
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);
        }
      } else {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      }
    }, err => {
      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);
      this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
    });
  }

  getFeesDetails() {

    setTimeout(() => { this.allEventEmitters.showLoader.emit(true); }, 1);
    this._studentService.feesDetails().subscribe(data => {

      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);

      if (data.status != undefined) {
        if (data.status == 1) {
          this.totalFees = data.dataJson.mainInvoices;
          this.miscInvoices = data.dataJson.miscInvoices;
          this.admissionInvoices = data.dataJson.admissionInvoices;
          this.createTotalFeesArray();
        } else if (data.status == 0) {
          this.showFeesBlock = false;
          this.showFeesEmptyMsg = true;
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);
        }
      } else {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      }
    }, err => {
      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);      
      this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
    });
  }

  checkLocalValues() {

    let localFeesParsed:any;
    let localValues:any;
    let localMiscF:any;
    let localAdmInvoices:any;
    if (this.panelMode == 'pendingFees') {
      localFeesParsed = globalFunctions.getLocalStorage('localPeF', 'JsonParse');
      localMiscF = globalFunctions.getLocalStorage('localMiscF', 'JsonParse');
      localAdmInvoices = globalFunctions.getLocalStorage('localAdmInvoices', 'JsonParse');
    } else if (this.panelMode == 'paidFees') {
      localFeesParsed = globalFunctions.getLocalStorage('localPaF', 'JsonParse');
      localMiscF = [];
      localAdmInvoices = [];
    }

    this.feesArray = localFeesParsed;
    this.miscInvoices = localMiscF;
    this.admissionInvoices = localAdmInvoices;
    this.calcArray();
  }

  createTotalFeesArray() {

    this.feesArray = [];
    this.totalFees.forEach((feeDetails) => {
      let totalbalance = 0;
      feeDetails.feesParticulars.forEach((feesParticular) => {
        feesParticular.miErrors = false;
        feesParticular.miErrorsMsg = '';

        if (this.page == 'collectFees') {
          feesParticular.isEditable = true;
          feesParticular.isSelected = true;
        }
        totalbalance = totalbalance + Number(feesParticular.enteredAmt);
      });
      feeDetails.totalbalance = totalbalance;
      feeDetails.totalBalanceError = false;
      feeDetails.totalBalanceErrorMsg = '';

      if (this.page == 'collectFees') {
        feeDetails.isCompulsory = false;
      }

      if ( this.panelMode == 'pendingFees' && (!feeDetails.isSettled) ) {
        this.feesArray.push(feeDetails);
      } else if ( this.panelMode == 'paidFees' && (feeDetails.isSettled) ) {
        this.feesArray.push(feeDetails);
      }
    });

    if (this.panelMode == 'paidFees') {
      this.miscInvoices = [];
      this.admissionInvoices = [];
    }

    this.calcArray('setLocalValues');
  }

  calcArray(mode = '') {

    let totalParticularsAmount = 0;
    let selectedCards = 0;
    let allCards = 0;
    let outstdingCnt = 0;
    let totalSelectedParticular = 0;
    let totalFeesParticularsLength = 0;
    this.feesArray.forEach((feeDetails) => {

      allCards++;
      outstdingCnt++;

      if (feeDetails.isCompulsory == true) {
        feeDetails.isSelected = true;
      }

  		feeDetails.particularSelectAll = false;
  		if (feeDetails.isSelected == true) {

  			selectedCards++;

  			let totalbalance = 0;
  			let selectedParticular = 0;
  			let feesParticularsLength = 0;
  			feeDetails.feesParticulars.forEach((feesParticular) => {
          feesParticular.balanceFees = Number(feesParticular.balanceAmount - feesParticular.enteredAmt);
  				if (feesParticular.isSelected == true) {
  					totalbalance = totalbalance + Number(feesParticular.enteredAmt);
  				}
  				if (feesParticular.isSelected == true && feesParticular.isSettled == false) {
  					selectedParticular++;
  				}
  				if (feesParticular.isSettled == false) {
  					feesParticularsLength++;
  				}
  			});
  			feeDetails.totalBalanceError = false;      
  			feeDetails.totalbalance = totalbalance;
  			if (selectedParticular == feesParticularsLength) {
  				feeDetails.particularSelectAll = true;
  			}
  			totalParticularsAmount = feeDetails.totalbalance + totalParticularsAmount;

  			totalSelectedParticular = totalSelectedParticular + selectedParticular;
  			totalFeesParticularsLength = totalFeesParticularsLength + feesParticularsLength;
  		}
    });

    let totalMiscAmount = 0;
    if (!globalFunctions.isEmpty(this.miscInvoices)) {
      this.miscInvoices.forEach((miscInvoice) => {
        outstdingCnt++;        
        let totalAmt = 0;
        miscInvoice.isSelected = false;
        miscInvoice.invoices.forEach((invoice) => {
          if ( parseInt(invoice.userAddedQuantity) > 0) {
            miscInvoice.isSelected = true;
            invoice.payingAmount = Number(invoice.amount) * parseInt(invoice.userAddedQuantity);
            totalMiscAmount = invoice.payingAmount + totalMiscAmount;          
            totalAmt = invoice.payingAmount + totalAmt;          
          }
        });
        miscInvoice.totalAmt = totalAmt;
      });
    }

    let totalAdmInvoicesAmount = 0;
    if (!globalFunctions.isEmpty(this.admissionInvoices)) {
      this.admissionInvoices.forEach((admissionInvoice) => {
        outstdingCnt++;        
        admissionInvoice.isSelected = true;        
        totalAdmInvoicesAmount = admissionInvoice.totalFormFees + totalAdmInvoicesAmount;          
      });
    }

    this.totalPayableAmount = totalMiscAmount + totalParticularsAmount + totalAdmInvoicesAmount;

    this.allSelected = false;
    if (allCards == selectedCards) {
      this.allSelected = true;
    }

    if (outstdingCnt > 0) {
      this.showFeesEmptyMsg = false;
      this.showFeesBlock = true;
    } else {
      this.showFeesBlock = false;
      this.showFeesEmptyMsg = true;
    }

    localStorage.setItem("seltdCardsCnt", JSON.stringify(selectedCards));
    this.cartCount = selectedCards;
    this.feesCount = totalSelectedParticular;
    this.allEventEmitters.setCartIconCount.emit(selectedCards);

    if (mode == 'setLocalValues') {
      if (this.panelMode == 'pendingFees') {
        localStorage.removeItem('localCoF');
        globalFunctions.setLocalStorage('localPeF', this.feesArray);
        globalFunctions.setLocalStorage('localMiscF', this.miscInvoices);
        globalFunctions.setLocalStorage('localAdmInvoices', this.admissionInvoices);
      } else if (this.panelMode == 'paidFees') {
        globalFunctions.setLocalStorage('localPaF', this.feesArray);
      }
    }

    let openCart = globalFunctions.getLocalStorage('openCart', 'JsonParse');
    if (!globalFunctions.isEmpty(openCart)) {
      this.settings.loadingSpinner = true;
      this.router.navigate(['/openCart']);      
    }
  }

  onChangeBalanceAmt(inputAmt, minAmt, balanceAmt, detailsindex, particularsindex) {

    if (globalFunctions.isEmpty(inputAmt)) {
      inputAmt = 0;
    }

    this.feesArray[detailsindex].feesParticulars[particularsindex].miErrors = false;
    this.feesArray[detailsindex].feesParticulars[particularsindex].enteredAmt = Number(inputAmt);

    if (inputAmt < minAmt) {
      if (this.page == 'collectFees') {
        this.calcArray('setLocalValues');
      } else {
        this.feesArray[detailsindex].feesParticulars[particularsindex].miErrors = true;
        this.feesArray[detailsindex].feesParticulars[particularsindex].miErrorsMsg = allMsgs.WRONG_MIN_AMOUNT + minAmt;
      }
    } else if (inputAmt > balanceAmt) {
      this.feesArray[detailsindex].feesParticulars[particularsindex].miErrors = true;      
      this.feesArray[detailsindex].feesParticulars[particularsindex].miErrorsMsg = allMsgs.WRONG_MAX_AMOUNT + balanceAmt;
    } else {
      this.calcArray('setLocalValues');
    }
  }

  onSelectAllCards(checked) {

    this._snackBarMsgComponent.closeSnackBar();
    this.feesArray.forEach((feeDetails) => {
      if (!feeDetails.isSettled && !feeDetails.isCompulsory) {
        feeDetails.feesParticulars.forEach((feesParticular) => {
          feesParticular.isSelected = checked;
        });
        feeDetails.isSelected = checked;
      }
    });

    this.calcArray('setLocalValues');
  }

  onSelectCard(feeDetails, detailsindex, checked) {

    this._snackBarMsgComponent.closeSnackBar();
    this.feesArray[detailsindex].isSelected = checked;
    this.feesArray[detailsindex].totalBalanceError = false;

    this.calcArray('setLocalValues');    
  }

  onPfSelectAll(feeDetails, detailsindex, checked) {

    this.feesArray[detailsindex].feesParticulars.forEach((particulars, index) => {
      particulars.isSelected = checked;
      particulars.miErrors = false;
    });
    this.feesArray[detailsindex].totalBalanceError = false;

    this.calcArray('setLocalValues');
  }

  onSelectFees(feesParticular, detailsindex, particularsindex, checked) {

    this.feesArray[detailsindex].feesParticulars[particularsindex].isSelected = checked;
    this.feesArray[detailsindex].totalBalanceError = false;
    this.feesArray[detailsindex].feesParticulars[particularsindex].miErrors = false;

    this.calcArray('setLocalValues');
  }

  onAddMisFees(invoice, detailsindex, invoiceIndex) {

    let maxQuantity = parseInt(this.miscInvoices[detailsindex].invoices[invoiceIndex].maxQuantity);

    if ( parseInt(this.miscInvoices[detailsindex].invoices[invoiceIndex].userAddedQuantity) < maxQuantity ) {

      this.miscInvoices[detailsindex].invoices[invoiceIndex].userAddedQuantity = parseInt(this.miscInvoices[detailsindex].invoices[invoiceIndex].userAddedQuantity) + 1;
      
      this.calcArray('setLocalValues');

    } else {
      this._snackBarMsgComponent.openSnackBar(allMsgs.MAX_QTY_ERROR + maxQuantity, 'x', 'error-snackbar', 5000);
    }
  }

  onRemoveMisFees(invoice, detailsindex, invoiceIndex) {

    if ( parseInt(this.miscInvoices[detailsindex].invoices[invoiceIndex].userAddedQuantity) >= 1 ) {

      this.miscInvoices[detailsindex].invoices[invoiceIndex].userAddedQuantity = parseInt(this.miscInvoices[detailsindex].invoices[invoiceIndex].userAddedQuantity) - 1;

      this.calcArray('setLocalValues');
    }
  }
  
  onProceedToPay() {

    let errFound = false;
    let cartCnt = 0;

    if (!globalFunctions.isEmpty(this.feesArray)) {

      this.feesArray.forEach((feeDetails, index) => {

        feeDetails.totalBalanceError = false;
        
        if (feeDetails.isSelected == true) {

          cartCnt++;

          feeDetails.feesParticulars.forEach((feesParticular) => {

            if (feesParticular.isSelected == true) {

              if (feesParticular.miErrors == true) {
                errFound = true;
              }

              if (feesParticular.enteredAmt == 0 && feesParticular.isEditable == true && feesParticular.isSettled == false) {
                feeDetails.totalBalanceError = true;
                feeDetails.totalBalanceErrorMsg = allMsgs.REQUIRED_BALANCE_AMOUNT;
                feesParticular.miErrors = true;
                feesParticular.miErrorsMsg = 'Please enter some amount';
                errFound = true;
              }
            }
          });

          if (feeDetails.totalbalance == 0) {
            errFound = true;
            feeDetails.totalBalanceError = true;
            feeDetails.totalBalanceErrorMsg = allMsgs.REQUIRED_BALANCE_AMOUNT;
          }
        }
      });
    }

    if (!globalFunctions.isEmpty(this.miscInvoices)) {
      this.miscInvoices.forEach((miscInvoice) => {
        if (miscInvoice.isSelected) {
          cartCnt++;
        }
      });
    }

    if (!globalFunctions.isEmpty(this.admissionInvoices)) {
      this.admissionInvoices.forEach((admissionInvoice) => {
        if (admissionInvoice.isSelected) {
          cartCnt++;
        }
      });
    }

    if (cartCnt == 0) {
      this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_FEES_APPLICATION, 'x', 'error-snackbar', 5000);
    } else if (errFound) {
      this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);
    } else {
      if (this.page == 'collectFees') {
        this.showFeesBlock = false;
        this.showFeesEmptyMsg = false;
        this.showCartPage = true;
      } else {
        this.feesSubmit();
      }
    }
  }

  feesSubmit() {

    this.allEventEmitters.showLoader.emit(true);
    this._studentService.feesSubmit(this.feesArray, this.miscInvoices, this.admissionInvoices).subscribe(data => {

      this.allEventEmitters.showLoader.emit(false);

      if (data.status != undefined) {

        if (data.status == 1) {

          globalFunctions.setLocalStorage('localCoF', data.dataJson.convinienceOption);
          this.router.navigate(['/cart']);

        } else if (data.status == 0) {

          localStorage.removeItem('localPeF');
          localStorage.removeItem('localMiscF');
          localStorage.removeItem('localAdmInvoices');
          localStorage.removeItem('localPaF');
          localStorage.removeItem('localCoF');

          this.getFeesDetails();          

          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);
        }
      } else {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      }
    }, err => {
      this.allEventEmitters.showLoader.emit(false);      
      this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
    });
  }

  downloadReceipt(feeDetails) {

    let length = feeDetails.feesReceipts.length;
    if (length > 1) {
      this.openPayFeesDialog(feeDetails);
    } else {
      this.getReceiptUrl(feeDetails.feesReceipts[0].receiptId);
    }
  }

  getReceiptUrl(receiptId) {

    this.allEventEmitters.showLoader.emit(true);
    this._paymentService.getReceiptUrl(receiptId).subscribe(data => {

      this.allEventEmitters.showLoader.emit(false);

      if (data.status != undefined) {

        if (data.status == 1) {

          var win = window.open(data.dataJson.receiptUrl, '_blank');
          if (win) {
            win.focus();
          } else {
            alert('Please allow popups for this website');
          }          

        } else if (data.status == 0) {
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);
        }
      } else {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      }
    }, err => {
      this.allEventEmitters.showLoader.emit(false);      
      this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
    });
  }

  openPayFeesDialog(element, mode = '') {

    let dialogRef = this.dialog.open(ReceiptsDialogComponent, {
      height: '400px',
      width: '500px',
    });

    dialogRef.componentInstance.mode          = 'paidFees';
    dialogRef.componentInstance.modalTitle    = 'Download Receipts';
    dialogRef.componentInstance.receiptsArray = element.feesReceipts;

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  onAddUpdateFees(values: any) {
    this.showCartPage = false;
    this.showFeesBlock = true;
    this.checkLocalValues();
  }

}