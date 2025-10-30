import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';

import { SnackBarMsgComponent } from 'app-shared-components/snack-bar-msg/snack-bar-msg.component';
import { AdmissionService } from 'app-shared-services/admission.service';
import { CommonService } from 'app-shared-services/common.service';
import { PaymentService } from 'app-shared-services/payment.service';
import { ReceiptsDialogComponent } from 'app-shared-components/receipts-dialog/receipts-dialog.component';

import { AllEventEmitters } from 'app/global/all-event-emitters';

import * as globalFunctions from 'app/global/globalFunctions';
import * as allMsgs from 'app/global/allMsgs';
import { Settings } from 'app/app.settings.model';
import { AppSettings } from 'app/app.settings';

@Component({
	selector: 'payment-result',
	templateUrl: './payment-result.component.html',
	styleUrls: ['./payment-result.component.css'],
	providers: [
		SnackBarMsgComponent, 
		AdmissionService, 
		CommonService, 
		PaymentService
	],
})
export class PaymentResultComponent implements OnInit {

	public settings:Settings;

	showSuccessBox: boolean = false;
	showErrorBox: boolean = false;
	showPendingBox: boolean = false;
	showDownloadReceipt: boolean = false;
	showReceiptErrorBox: boolean = false;

	paymentTransactionNo:string;
	transactionRefNo:string;
	transactionAmount:string;
	bankReferenceNo:string;
	errorMsg:string;
	receiptUrl:string;
	totalReceipts = [];

	formType: string = '';
	atktFormUrls = [];
	formUrls = [];
	showForms;
	userTypeId: number;

	constructor(
		public dialog: MatDialog,		
		private router: Router,
		public _snackBarMsgComponent: SnackBarMsgComponent,
		private _admissionService: AdmissionService,
		private _commonService: CommonService,		
		private _paymentService: PaymentService,	
    	public appSettings:AppSettings, 
		private allEventEmitters: AllEventEmitters
	) {
    	this.settings = this.appSettings.settings;		
	}

	ngOnInit() {
		this.checkPaymentStatus();
	}

	ngAfterViewInit(){
		setTimeout(() => { this.settings.loadingSpinner = false }, 300)  
	}

	checkPaymentStatus() {

		let pTrId = globalFunctions.getLocalStorage('pTrId', 'JsonParse');

		// let pTrId = 95340;
    	this.userTypeId = globalFunctions.getUserProf('userTypeId');
	    // userTypeId = 
	    // 1 = Admin 
	    // 2 = Institute
	    // 3 = Student
	    // 5 = Admission

		if (globalFunctions.isEmpty(pTrId)) {
			if (this.userTypeId == 5) {
				this.router.navigate(['/downloadForms']);
			} else if (this.userTypeId == 3) {
				this.router.navigate(['/pendingFees']);
			} else {
				this.router.navigate(['/dashboard']);
			}
		} else {
			this.formType = globalFunctions.getUserProf('formType');
			if (this.userTypeId == 3) {
				this.getPaymentStatus(pTrId);
			} else if (this.userTypeId == 5) {
				if (this.formType == 'atkt' || this.formType == 'exam') {
		    		this.getAtktPaymentStatus(pTrId);
				} else {
					this.getAdmissionPaymentStatus(pTrId);
				}
			}
		}
	}

	getPaymentStatus(pTrId) {

		setTimeout(() => { this.allEventEmitters.showLoader.emit(true); }, 1);
		this._paymentService.getPaymentStatus(pTrId).subscribe(data => {

			setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);

			if (data.status != undefined) {

				localStorage.removeItem('pTrId');

				if (data.status == 1) {

					this.generateReceipts(pTrId);

					this.showErrorBox = false;
					this.showSuccessBox = true;

					this.paymentTransactionNo = data.dataJson.paymentTransactionNo;
					this.transactionRefNo     = data.dataJson.trackingId;
					this.transactionAmount    = data.dataJson.amount;
					this.bankReferenceNo      = data.dataJson.bankReferenceNo;

				} else if (data.status == 0) {

					this.showSuccessBox = false;
					this.showErrorBox = true;
					this.errorMsg = data.message;

					this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);
				}else if (data.status == 5) {

					this.showSuccessBox = false;
					this.showErrorBox = false;
					this.showPendingBox = true;
					this.errorMsg = data.message;

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

	getAtktPaymentStatus(pTrId) {

		setTimeout(() => { this.allEventEmitters.showLoader.emit(true); }, 1);
		this._paymentService.getPaymentStatus(pTrId).subscribe(data => {

			setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);

			if (data.status != undefined) {

				localStorage.removeItem('pTrId');

				if (data.status == 1) {

					this.generateReceipts(pTrId);

					this.showErrorBox = false;
					this.showSuccessBox = true;

					this.paymentTransactionNo = data.dataJson.paymentTransactionNo;
					this.transactionRefNo     = data.dataJson.trackingId;
					this.transactionAmount    = data.dataJson.amount;
					this.bankReferenceNo      = data.dataJson.bankReferenceNo;

				} else if (data.status == 0) {

					this.showSuccessBox = false;
					this.showErrorBox = true;
					this.errorMsg = data.message;

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

	getAdmissionPaymentStatus(pTrId) {

		setTimeout(() => { this.allEventEmitters.showLoader.emit(true); }, 1);
		this._admissionService.getPaymentStatus(pTrId).subscribe(data => {

			setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);

			if (data.status != undefined) {

				localStorage.removeItem('pTrId');

				if (data.status == 1) {

					this.generateReceipts(pTrId);

          			globalFunctions.setUserProf('applicantId', data.dataJson.applicantId);

					this.showErrorBox = false;
					this.showSuccessBox = true;

					this.paymentTransactionNo = data.dataJson.paymentTransactionNo;
					this.transactionRefNo     = data.dataJson.trackingId;
					this.transactionAmount    = data.dataJson.amount;
					this.bankReferenceNo      = data.dataJson.bankReferenceNo;

				} else if (data.status == 0) {

					this.showSuccessBox = false;
					this.showErrorBox = true;
					this.errorMsg = data.message;

					this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);
				}else if (data.status == 5) {

					this.showSuccessBox = false;
					this.showErrorBox = false;
					this.showPendingBox = true;
					this.errorMsg = data.message;

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

	generateReceipts(pTrId) {

		this.allEventEmitters.showLoader.emit(true);
		this._commonService.generateReceipts(pTrId).subscribe(data => {

			this.allEventEmitters.showLoader.emit(false);

			if (data.status != undefined) {
				if (data.status == 1) {
					this.totalReceipts = data.dataJson.paymentReceipts;
					this.formUrls = data.dataJson.forms;
					this.showForms = data.dataJson.showForms;	
					this.showDownloadReceipt = true;
					this.downloadAllForm(data.dataJson.forms);
				} else if (data.status == 0) {
					this.showReceiptErrorBox = true;
					this.errorMsg = data.message;
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

	downloadAllForm(formUrls) {
	    if (formUrls.length) {
	      formUrls.forEach((url) => {
	        this.downloadForm(url.formUrl);
	      });
	    }
	}
	downloadForm(formUrl) {
	    var win = window.open(formUrl, '_blank');
	    if (win) {
	      win.focus();
	    } else {
	      alert('Please allow popups for this website');
	    }
	  }

	downloadReceipt() {

		if ( (this.totalReceipts.length > 1 || this.formUrls.length > 1) || (this.formUrls.length == 1 && this.totalReceipts.length == 1) ) {
			this.openPayFeesDialog(this.totalReceipts, this.formUrls);
		} else {

			if (this.formUrls.length == 1) {
				let win = window.open(this.formUrls[0].formUrl, '_blank');
				if (win) {
					win.focus();
				} else {
					alert('Please allow popups for this website');
				}
			}
			
			if (this.totalReceipts.length == 1) {
				let win2 = window.open(this.totalReceipts[0].receiptUrl, '_blank');
				if (win2) {
					win2.focus();
				} else {
					alert('Please allow popups for this website');
				}
			}
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

	openPayFeesDialog(totalReceipts, formUrls) {
		let dialogRef = this.dialog.open(ReceiptsDialogComponent, {
			height: '400px',
			width: '800px',
		});

		dialogRef.componentInstance.mode          = 'payment-result';
		dialogRef.componentInstance.modalTitle    = 'Receipts';
		dialogRef.componentInstance.receiptsArray = totalReceipts;
		dialogRef.componentInstance.formUrlsArray = formUrls;
		dialogRef.componentInstance.showForms = this.showForms;

		dialogRef.afterClosed().subscribe(result => {
		});
	}

	backToHome() {

	    // userTypeId = 
	    // 1 = Admin 
	    // 2 = Institute
	    // 3 = Student
	    // 5 = Admission

		if (this.userTypeId == 5 && (this.formType == 'atkt' || this.formType == 'exam')) {
			this.router.navigate(['/atktForm']);
		} else if (this.userTypeId == 5 && (this.formType == '' || this.formType == 'preReg') ) {
			this.router.navigate(['/admissionForm']);
		} else if (this.userTypeId == 3) {
			let redirectUrl = globalFunctions.getLocalStorage('redirectUrl', 'JsonParse');
			let openCart = globalFunctions.getLocalStorage('openCart', 'JsonParse');
        	localStorage.removeItem('openCart');
        	localStorage.removeItem('redirectUrl');
			if ( !globalFunctions.isEmpty(redirectUrl) && this.showSuccessBox ) {
				window.location.href = redirectUrl;
			} else if ( !globalFunctions.isEmpty(redirectUrl) && openCart ) {
				window.location.href = redirectUrl;
			} else {
				this.router.navigate(['/pendingFees']);
			}
		} else {
			let redirectUrl = globalFunctions.getLocalStorage('redirectUrl', 'JsonParse');
        	localStorage.removeItem('redirectUrl');
			if ( !globalFunctions.isEmpty(redirectUrl) ) {
				window.location.href = redirectUrl;
			}
		}
	}

}
