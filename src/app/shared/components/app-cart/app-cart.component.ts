import { Component, OnInit, ViewEncapsulation, ElementRef, ViewChild, Inject, Input, Output, EventEmitter } from '@angular/core';
import { UntypedFormControl, UntypedFormBuilder, UntypedFormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';

import { DatePipe } from '@angular/common';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';

import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';

import { ReceiptsDialogComponent } from 'app-shared-components/receipts-dialog/receipts-dialog.component';

import { SnackBarMsgComponent } from 'app-shared-components/snack-bar-msg/snack-bar-msg.component';

import { StudentService } from 'app-shared-services/student.service';
import { InstitutesService } from 'app-shared-services/institutes.service';
import { AdmissionService } from 'app-shared-services/admission.service';
import { AtktService } from 'app-shared-services/atkt.service';
import { ThirdPartyService } from 'app-shared-services/thirdParty.service';

import * as globalFunctions from 'app/global/globalFunctions';
import * as allMsgs from 'app/global/allMsgs';

import { AllEventEmitters } from 'app/global/all-event-emitters';
import { environment } from 'environments/environment';

export const MY_FORMATS = {
	parse: {
		dateInput: 'LL',
	},
	display: {
		dateInput: 'LL',
		monthYearLabel: 'MMM YYYY',
		dateA11yLabel: 'LL',
		monthYearA11yLabel: 'MMMM YYYY',
	},
};

@Component({
	selector: 'app-cart',
	templateUrl: './app-cart.component.html',
	styleUrls: ['./app-cart.component.css'],
	providers: [
	SnackBarMsgComponent, 
	AdmissionService, 
	AtktService, 
	StudentService,
	InstitutesService,
	ThirdPartyService,
	DatePipe,
	{provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},    
	{provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}    
	],
	encapsulation: ViewEncapsulation.None	
})

export class AppCartComponent implements OnInit {

	@Input('formType') formType;
	@Input('paymentOption') paymentOption;
	@Input('page') page;
	@Input('studentId') studentId;
	@Input('dialogRef') dialogRef;

	@Output() onAddUpdateFees:EventEmitter<any> = new EventEmitter();

	@ViewChild('cashReceiptDateElementFocus') _cashReceiptDateInput: ElementRef;
	@ViewChild('ddReceiptDateElementFocus') _ddReceiptDateInput: ElementRef;
	@ViewChild('ddDateElementFocus') _ddDateInput: ElementRef;
	@ViewChild('chequeReceiptDateElementFocus') _chequeReceiptDateInput: ElementRef;
	@ViewChild('chequeDateElementFocus') _chequeDateInput: ElementRef;
	@ViewChild('neftReceiptDateElementFocus') _neftReceiptDateInput: ElementRef;
	@ViewChild('neftDateElementFocus') _neftDateInput: ElementRef;
	@ViewChild('mswipeReceiptDateElementFocus') _mswipeReceiptDateInput: ElementRef;

	totalReceipts = [];

	globalFunctions: any = globalFunctions;
	allMsgs: any = allMsgs;

	totalCartDetailsArray:any = [];
	addUpdateCourseBtn:boolean = false;
	totalFeesArray = [];
	admissionInvoices = [];
	miscInvoices = [];

	convenienceFeesArray = [];
	cartSubjectsDetailsArray:any = [];

	cartCount: number = 0;
	totalItemsAmount: number = 0;
	paymentOptionError: boolean = false;
	showOfflinePayOptionsBlock: boolean = false;
	paymentOptionErrorMessage: string;
	convenienceFeesAmt: number = 0;
	showCartPage: boolean = false;

	removable: boolean = true;
	totalPayableAmount: number = 0;

	paymentOptionId: number;
	paymentOptions = [
	{id: 5, name: 'Cash'},
	{id: 6, name: 'DD'},
	{id: 7, name: 'Cheque'},
	{id: 8, name: 'NEFT / RTGS'},
	{id: 9, name: 'mswipe'},
	];
	paymentOptionValues = [];

	maxDate = new Date(2018, 1, 1);
	cashForm: UntypedFormGroup;
	cashReceiptDate:AbstractControl;
	showCashForm: boolean = false;
	ddForm: UntypedFormGroup;
	ddReceiptDate:AbstractControl;
	ddDate:AbstractControl;
	showDdForm: boolean = false;
	chequeForm: UntypedFormGroup;
	chequeReceiptDate:AbstractControl;
	chequeDate:AbstractControl;
	showChequeForm: boolean = false;
	neftForm: UntypedFormGroup;
	neftReceiptDate:AbstractControl;
	neftDate:AbstractControl;
	showNeftForm: boolean = false;
	mswipeForm: UntypedFormGroup;
	mswipeReceiptDate:AbstractControl;
	mswipeTransacNo:AbstractControl;
	showMswipeForm: boolean = false;
	showConvenienceFeesOptions: boolean = false;	
	instituteHeader: string;	
	redirectUrl: string;	

	headerImage: any = '';
	showEmptyCart: boolean = false;
	showInstMsg: boolean = false;
	instMsg: string;

	constructor( 
		public dialog: MatDialog,
		private _formBuilder: UntypedFormBuilder,		
		private allEventEmitters: AllEventEmitters,
		public _snackBarMsgComponent: SnackBarMsgComponent,
		private _admissionService: AdmissionService,
		private _atktService: AtktService,
		private _studentService: StudentService,
		private _institutesService: InstitutesService,
		private _thirdPartyService: ThirdPartyService,
		private datePipe: DatePipe,
		private router: Router
		) {	

		this.headerImage = globalFunctions.getUserProf('headerImage');

		this.maxDate = new Date(this.datePipe.transform(new Date(), 'yyyy, MM, dd'));    

		this.allEventEmitters.setTitle.emit(
			environment.WEBSITE_NAME + ' - ' +
			environment.PANEL_NAME + 
			' | Cart'
			);
	}

	ngOnInit(): void {

		if (this.formType == 'studentFees') {
			let localPeF = globalFunctions.getLocalStorage('localPeF', 'JsonParse');
			let localMiscF = globalFunctions.getLocalStorage('localMiscF', 'JsonParse');
			let localAdmInvoices = globalFunctions.getLocalStorage('localAdmInvoices', 'JsonParse');      		
			this.showCartPage = false;
			this.showEmptyCart = false;
			if ( !globalFunctions.isEmpty(localPeF) || !globalFunctions.isEmpty(localMiscF) || !globalFunctions.isEmpty(localAdmInvoices) ) {
				if (this.page == 'collectFees') {
					this.setValues('', 'setLocalValues');
					this.createOfflinePaymentForms();
				} else {
					this.setValues('', 'checkSelectedCards');
				}
			}
		} else if (this.formType == 'openCart') {
			this.getOpenCart();
		} else {
			this.formType = globalFunctions.getUserProf('formType');
			if (this.formType == 'atkt' || this.formType == 'exam') {
				this.atktListCart();
			} else {
				this.listCart();
			}

			if (this.formType == 'preReg') {
				this.removable = false;
			}
		}
	}

	createOfflinePaymentForms() {

		this.cashForm = this._formBuilder.group({
			'cashReceiptDate' : [new Date(''), Validators.required]
		});
		this.cashReceiptDate = this.cashForm.controls['cashReceiptDate'];

		this.ddForm = this._formBuilder.group({
			'ddReceiptDate' : [new Date(''), Validators.required],
			'ddDate' : [new Date(''), Validators.required],
			'ddAmount' : [null, Validators.required],
			'dDNo' : [null, Validators.required],
			'bankName' : [null, Validators.required],
			'branchName' : [null, Validators.required]
		});
		this.ddReceiptDate = this.ddForm.controls['ddReceiptDate'];
		this.ddDate = this.ddForm.controls['ddDate'];

		this.chequeForm = this._formBuilder.group({
			'chequeReceiptDate' : [new Date(''), Validators.required],
			'chequeDate' : [new Date(''), Validators.required],
			'chequeAmount' : [null, Validators.required],
			'chequeNo' : [null, Validators.required],
			'bankName' : [null, Validators.required],
			'branchName' : [null, Validators.required]
		});
		this.chequeReceiptDate = this.chequeForm.controls['chequeReceiptDate'];
		this.chequeDate = this.chequeForm.controls['chequeDate'];

		this.neftForm = this._formBuilder.group({
			'neftReceiptDate' : [new Date(''), Validators.required],
			'neftDate' : [new Date(''), Validators.required],
			'transactionId' : [null, Validators.required]
		});
		this.neftReceiptDate = this.neftForm.controls['neftReceiptDate'];
		this.neftDate = this.neftForm.controls['neftDate'];

		this.mswipeForm = this._formBuilder.group({
			'mswipeReceiptDate' : [new Date(''), Validators.required],
			'mswipeTransacNo' : [null, Validators.required]
		});
		this.mswipeReceiptDate = this.mswipeForm.controls['mswipeReceiptDate'];
	}

	getOpenCart() {

		setTimeout(() => { this.allEventEmitters.showLoader.emit(true); }, 1);
		this._thirdPartyService.getOpenCart().subscribe(data => {

			setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);

			if (data.status != undefined) {
				if (data.status == 1) {
					this.setValues(data.dataJson);
				} else if (data.status == 0) {
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

	listCart() {

		setTimeout(() => { this.allEventEmitters.showLoader.emit(true); }, 1);
		this._admissionService.listCart().subscribe(data => {

			setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);

			if (data.status != undefined) {
				if (data.status == 1) {
					this.setValues(data.dataJson);
				} else if (data.status == 2) {
					this.instMsg = data.message;
					this.showInstMsg = true;
					this.showCartPage = false;
					this.showEmptyCart = false;
				} else if (data.status == 0) {
					this.showEmptyCart = true;
					this.showInstMsg = false;
					this.showCartPage = false;
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

	atktListCart() {

		setTimeout(() => { this.allEventEmitters.showLoader.emit(true); }, 1);
		this._atktService.listCart().subscribe(data => {

			setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);

			if (data.status != undefined) {
				if (data.status == 1) {
					this.setValues(data.dataJson);
				} else if (data.status == 0) {
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

	removeCourse(admissionConfId: number, instituteId): void {

		if (admissionConfId) {

			this.allEventEmitters.showLoader.emit(true);
			this._admissionService.removeCourse(instituteId, admissionConfId).subscribe(data => {

				this.allEventEmitters.showLoader.emit(false);

				if (data.status != undefined) {

					if (data.status == 1) {

						this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'success-snackbar', 5000);

						this.setValues(data.dataJson);

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
	}

	setValues(data: any = '', mode = '') {

		if (this.formType == 'studentFees') {

			let localMiscF:any;
			let localPeF:any;
			let localCoF:any;
			let localAdmInvoices:any;

			localPeF = globalFunctions.getLocalStorage('localPeF', 'JsonParse');
			localMiscF = globalFunctions.getLocalStorage('localMiscF', 'JsonParse');
			localCoF = globalFunctions.getLocalStorage('localCoF', 'JsonParse');
			localAdmInvoices = globalFunctions.getLocalStorage('localAdmInvoices', 'JsonParse');

			this.totalFeesArray = localPeF;
			this.miscInvoices = localMiscF;
			this.admissionInvoices = localAdmInvoices;		    
			this.convenienceFeesArray = localCoF;

		} else if (this.formType == 'openCart') {

			this.totalFeesArray = data.invoices;
			this.convenienceFeesArray = data.convinienceOption;
			this.instituteHeader = data.instituteHeader;
			this.redirectUrl = data.redirectUrl;
			globalFunctions.setLocalStorage('redirectUrl', this.redirectUrl);			

		} else {

			if (this.formType == 'atkt' || this.formType == 'exam') {
				this.cartSubjectsDetailsArray = data.cart.subjects;
			}
			this.totalCartDetailsArray = data.cart;
			this.addUpdateCourseBtn = data.addUpdateCourseBtn;
			this.convenienceFeesArray = data.convinienceOption;
		}

		this.showConvenienceFeesOptions = true;
		if (this.convenienceFeesArray.length == 1) {
			if (this.convenienceFeesArray[0].paymentValue == 0) {
				this.showConvenienceFeesOptions = false;
				this.paymentOptionId = this.convenienceFeesArray[0].paymentOptionId;
			}
		}

		this.calcTotal(mode);
	}

	calcTotal(mode = '') {

		if (this.formType == 'openCart') {

			let totalFees = 0;
			let selectedCards = 0;
			this.totalFeesArray.forEach((details) => {
				selectedCards++;
				details.totalBalanceError = false;
				totalFees = details.totalFees + totalFees;
			});

			this.cartCount = selectedCards;
			if (selectedCards > 0) {
				this.showCartPage = true;
				this.showEmptyCart = false;			
			} else {
				this.showEmptyCart = true;
				this.showCartPage = false;
			}

			this.totalItemsAmount   = totalFees;
			this.totalPayableAmount = this.totalItemsAmount + Number(this.convenienceFeesAmt);

		} else if (this.formType == 'studentFees') {

			let totalParticularsAmount = 0;
			let selectedCards = 0;		
			this.totalFeesArray.forEach((feeDetails) => {

				feeDetails.totalBalanceError = false;

				if (feeDetails.isSelected == true) {
					selectedCards++;
					totalParticularsAmount = feeDetails.totalbalance + totalParticularsAmount;
				}
			});

			let totalMiscAmount = 0;
			if (!globalFunctions.isEmpty(this.miscInvoices)) {

				this.miscInvoices.forEach((miscInvoice) => {

					if (miscInvoice.isSelected == true) {

						let totalAmt = 0;
						miscInvoice.invoices.forEach((invoice) => {

							if ( parseInt(invoice.userAddedQuantity) > 0) {
								invoice.payingAmount = Number(invoice.amount) * parseInt(invoice.userAddedQuantity);
								totalMiscAmount = invoice.payingAmount + totalMiscAmount;          
								totalAmt = invoice.payingAmount + totalAmt;          
							}
						});
						miscInvoice.totalAmt = totalAmt;
					}
				});
			}

			let totalAdmInvoicesAmount = 0;
			if (!globalFunctions.isEmpty(this.admissionInvoices)) {
				this.admissionInvoices.forEach((admissionInvoice) => {
					totalAdmInvoicesAmount = admissionInvoice.totalFormFees + totalAdmInvoicesAmount;          
				});
			}

			this.totalItemsAmount   = totalMiscAmount + totalParticularsAmount + totalAdmInvoicesAmount;
			this.totalPayableAmount = this.totalItemsAmount + Number(this.convenienceFeesAmt);

			this.allEventEmitters.setCartIconCount.emit(selectedCards);
			this.cartCount = selectedCards;

			if (selectedCards > 0 || totalMiscAmount > 0 || totalAdmInvoicesAmount > 0) {
				this.showCartPage = true;
				this.showEmptyCart = false;
			} else {
				this.showEmptyCart = true;
				this.showCartPage = false;
			}

			if (mode == 'checkSelectedCards') {
				let localCoF = globalFunctions.getLocalStorage('localCoF', 'JsonParse');
				if (globalFunctions.isEmpty(localCoF) && selectedCards > 0) {
					this.feesSubmit();
				}
			}

			if (mode == 'setLocalValues') {

				globalFunctions.setLocalStorage('localPeF', this.totalFeesArray);
				globalFunctions.setLocalStorage('localMiscF', this.miscInvoices);				
				globalFunctions.setLocalStorage('localAdmInvoices', this.admissionInvoices);				
			}

		} else if (this.formType == 'atkt' || this.formType == 'exam') {

			this.totalItemsAmount = Number(this.totalCartDetailsArray.totalFormFees);
			this.cartCount = this.cartSubjectsDetailsArray.length;

			this.convenienceFeesArray.forEach((convDetails) => {
				if (convDetails.paymentOptionId == this.paymentOptionId) {
					this.convenienceFeesAmt = convDetails.paymentValue;
				}
			});

			this.totalPayableAmount = this.totalItemsAmount + Number(this.convenienceFeesAmt);

			if (!globalFunctions.isEmpty(this.totalPayableAmount)) {
				this.showCartPage = true;
				this.showEmptyCart = false;
				this.showInstMsg = false;
			}

		} else {

			let totalFormFees = 0;
			let selectedCourses = 0;
			this.totalCartDetailsArray.forEach((cartDetails) => {
				cartDetails.admissionConfs.forEach((cartDetails) => {
					selectedCourses++;
				});
				cartDetails.totalBalanceError = false;
				totalFormFees = Number(cartDetails.totalFormFees) + totalFormFees;
			});

			this.totalItemsAmount = totalFormFees;

			this.convenienceFeesArray.forEach((convDetails) => {
				if (convDetails.paymentOptionId == this.paymentOptionId) {
					this.convenienceFeesAmt = convDetails.paymentValue;
				}
			});

			this.totalPayableAmount = totalFormFees + Number(this.convenienceFeesAmt);

			this.cartCount = selectedCourses;

			this.showInstMsg = false;
			if (selectedCourses > 0) {
				this.showCartPage = true;
				this.showEmptyCart = false;
			} else {
				this.showCartPage = false;
				this.showEmptyCart = true;
			}
		}
	}

	onAddMisFees(invoice, detailsindex, invoiceIndex) {

		let maxQuantity = parseInt(this.miscInvoices[detailsindex].invoices[invoiceIndex].maxQuantity);

		if ( parseInt(this.miscInvoices[detailsindex].invoices[invoiceIndex].userAddedQuantity) < maxQuantity ) {

			this.miscInvoices[detailsindex].invoices[invoiceIndex].userAddedQuantity = parseInt(this.miscInvoices[detailsindex].invoices[invoiceIndex].userAddedQuantity) + 1;

			this.calcTotal('setLocalValues');

		} else {
			this._snackBarMsgComponent.openSnackBar(allMsgs.MAX_QTY_ERROR + maxQuantity, 'x', 'error-snackbar', 5000);
		}
	}

	onRemoveMisFees(invoice, detailsindex, invoiceIndex) {

		if ( parseInt(this.miscInvoices[detailsindex].invoices[invoiceIndex].userAddedQuantity) >= 1 ) {

			this.miscInvoices[detailsindex].invoices[invoiceIndex].userAddedQuantity = parseInt(this.miscInvoices[detailsindex].invoices[invoiceIndex].userAddedQuantity) - 1;

			this.calcTotal('setLocalValues');
		}
	}

	onRemoveMiscItem(miscInvoice, detailsindex) {

		this._snackBarMsgComponent.closeSnackBar();

		this.miscInvoices[detailsindex].isSelected = false;
		this.miscInvoices[detailsindex].invoices.forEach((invoice) => {
			invoice.userAddedQuantity = 0;
			invoice.payingAmount = 0;
		});

		if (this.page == 'collectFees') {
			this.calcTotal('setLocalValues');    
		} else {
			this.feesSubmit('onRemoveItem');    	
		}
	}

	onRemoveItem(feeDetails, detailsindex) {
		this._snackBarMsgComponent.closeSnackBar();
		this.totalFeesArray[detailsindex].isSelected = false;
		if (this.page == 'collectFees') {
			this.calcTotal('setLocalValues');    
		} else {
			this.feesSubmit('onRemoveItem');    	
		}
	}

	onChangePaymentOption(paymentOptionId, convenienceFeesAmt) {
		this.convenienceFeesAmt = Number(convenienceFeesAmt);
		this.paymentOptionId = paymentOptionId;
		this.paymentOptionError = false;
		if (this.formType == 'studentFees') {
			this.calcTotal('setLocalValues');
		} else {
			this.calcTotal();
		}
	}

	onChangeOfflinePaymentOption(paymentOptionId) {

		this.paymentOptionId = paymentOptionId;
		this.paymentOptionError = false;

		this.showCashForm = false;
		this.showDdForm = false;
		this.showChequeForm = false;
		this.showNeftForm = false;
		this.showMswipeForm = false;
		switch(paymentOptionId) {
			case 5:
			this.showCashForm = true;
			break;
			case 6:
			this.showDdForm = true;
			break;
			case 7:
			this.showChequeForm = true;
			break;
			case 8:
			this.showNeftForm = true;
			break;
			case 9:
			this.showMswipeForm = true;
			break;
			default:
		}
	}

	onProceedToPay() {

		if (this.formType == 'openCart') {

			let errFound = false;
			this.totalFeesArray.forEach((details, index) => {

				details.totalBalanceError = false;

				if (details.totalFees == 0) {

					details.totalBalanceError = true;
					details.totalBalanceErrorMsg = allMsgs.REQUIRED_CART_BALANCE_AMOUNT;

					errFound = true;
				}
			});

			if (globalFunctions.isEmpty(this.paymentOptionId)) {
				errFound = true;
				this.paymentOptionError = true;
				this.paymentOptionErrorMessage = allMsgs.REQUIRED_PAYMENT_OPTION;
			}

			if (errFound) {
				this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);
			} else {
				if (this.paymentOption == 'offline') {
					this.validateOfflineOptions();
				} else {
					this.thirdPartyFeesSubmit('onProceedToPay');
				}
			}

		} else if (this.formType == 'studentFees') {

			let errFound = false;
			this.totalFeesArray.forEach((feeDetails, index) => {

				feeDetails.totalBalanceError = false;

				if (feeDetails.isSelected == true) {

					feeDetails.feesParticulars.forEach((feesParticular) => {

						if (feesParticular.isSelected == true) {

							if (feesParticular.miErrors == true) {
								errFound = true;
							}
						}
					});

					if (feeDetails.totalbalance == 0) {

						feeDetails.totalBalanceError = true;
						feeDetails.totalBalanceErrorMsg = allMsgs.REQUIRED_CART_BALANCE_AMOUNT;

						errFound = true;
					}
				}
			});

			if (globalFunctions.isEmpty(this.paymentOptionId)) {
				errFound = true;
				this.paymentOptionError = true;
				this.paymentOptionErrorMessage = allMsgs.REQUIRED_PAYMENT_OPTION;
			}

			if (errFound) {
				this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);
			} else {
				if (this.paymentOption == 'offline') {
					this.validateOfflineOptions();
				} else {
					this.feesSubmit('onProceedToPay');
				}
			}

		} else if (this.formType == 'atkt' || this.formType == 'exam') {

			let errFound = false;
			this.cartSubjectsDetailsArray.forEach((feeDetails, index) => {
				feeDetails.totalBalanceError = false;
			});
			if (this.totalCartDetailsArray.totalFormFees == 0) {
				this.cartSubjectsDetailsArray[0].totalBalanceError = true;
				this.cartSubjectsDetailsArray[0].totalBalanceErrorMsg = allMsgs.REQUIRED_CART_BALANCE_AMOUNT;
				errFound = true;
			}

			if (globalFunctions.isEmpty(this.paymentOptionId)) {
				errFound = true;
				this.paymentOptionError = true;
				this.paymentOptionErrorMessage = allMsgs.REQUIRED_PAYMENT_OPTION;
			}

			if (errFound) {
				this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);
			} else {
				this.atktPayFees();
			}

		} else {
			let errFound = false;
			let isConvenceAmtZero = 0;
			this.convenienceFeesArray.forEach((convDetails) => {
				if (convDetails.convenienceFeesAmt == 0) {
					isConvenceAmtZero = 1;
				}
			});
			this.totalCartDetailsArray.forEach((feeDetails, index) => {
				feeDetails.totalBalanceError = false;
				if (feeDetails.totalFormFees == 0 && isConvenceAmtZero == 1) {
					feeDetails.totalBalanceError = true;
					feeDetails.totalBalanceErrorMsg = allMsgs.REQUIRED_CART_BALANCE_AMOUNT;
					errFound = true;
				}
			});
			


			if (globalFunctions.isEmpty(this.paymentOptionId)) {
				errFound = true;
				this.paymentOptionError = true;
				this.paymentOptionErrorMessage = allMsgs.REQUIRED_PAYMENT_OPTION;
			}

			if (errFound) {
				this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);
			} else {
				this.admissionPayFees('onProceedToPay');
			}
		}
	}

	validateOfflineOptions() {

		let errFound = false;
		let errFound2 = false;
		switch(this.paymentOptionId) {

			case 5:

			if (!this.cashForm.valid) {

				errFound = true;

				Object.keys(this.cashForm.controls).forEach(field => {
					const control = this.cashForm.get(field);
					if (control instanceof UntypedFormControl) {
						control.markAsTouched({ onlySelf: true });
					}
				});

				this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);

			} else {

				this.paymentOptionValues = [];
				this.paymentOptionValues = this.cashForm.value;
				this.paymentOptionValues['receiptDate'] = globalFunctions.format(new Date(this.cashForm.get("cashReceiptDate").value), 'input');
				delete this.paymentOptionValues['cashReceiptDate'];
			}

			break;

			case 6:

			if (!this.ddForm.valid) {

				errFound = true;

				Object.keys(this.ddForm.controls).forEach(field => {
					const control = this.ddForm.get(field);
					if (control instanceof UntypedFormControl) {
						control.markAsTouched({ onlySelf: true });
					}
				});

				this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);

			} else {

				if (Number(this.ddForm.get("ddAmount").value) != Number(this.totalPayableAmount)) {
					errFound2 = true;
				} else {
					this.paymentOptionValues = [];
					this.paymentOptionValues = this.ddForm.value;
					this.paymentOptionValues['receiptDate'] = globalFunctions.format(new Date(this.ddForm.get("ddReceiptDate").value), 'input');
					this.paymentOptionValues['ddDate'] = globalFunctions.format(new Date(this.ddForm.get("ddDate").value), 'input');
					delete this.paymentOptionValues['ddReceiptDate'];
				}
			}

			break;

			case 7:

			if (!this.chequeForm.valid) {

				errFound = true;

				Object.keys(this.chequeForm.controls).forEach(field => {
					const control = this.chequeForm.get(field);
					if (control instanceof UntypedFormControl) {
						control.markAsTouched({ onlySelf: true });
					}
				});

				this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);

			} else {

				if (Number(this.chequeForm.get("chequeAmount").value) != Number(this.totalPayableAmount)) {
					errFound2 = true;
				} else {
					this.paymentOptionValues = [];
					this.paymentOptionValues = this.chequeForm.value;
					this.paymentOptionValues['receiptDate'] = globalFunctions.format(new Date(this.chequeForm.get("chequeReceiptDate").value), 'input');
					this.paymentOptionValues['chequeDate'] = globalFunctions.format(new Date(this.chequeForm.get("chequeDate").value), 'input');
					delete this.paymentOptionValues['chequeReceiptDate'];
				}
			}

			break;

			case 8:

			if (!this.neftForm.valid) {

				errFound = true;

				Object.keys(this.neftForm.controls).forEach(field => {
					const control = this.neftForm.get(field);
					if (control instanceof UntypedFormControl) {
						control.markAsTouched({ onlySelf: true });
					}
				});

				this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);

			} else {

				this.paymentOptionValues = [];
				this.paymentOptionValues = this.neftForm.value;
				this.paymentOptionValues['receiptDate'] = globalFunctions.format(new Date(this.neftForm.get("neftReceiptDate").value), 'input');
				this.paymentOptionValues['neftDate'] = globalFunctions.format(new Date(this.neftForm.get("neftDate").value), 'input');
				delete this.paymentOptionValues['neftReceiptDate'];
			}

			break;

			case 9:

			if (!this.mswipeForm.valid) {

				errFound = true;

				Object.keys(this.mswipeForm.controls).forEach(field => {
					const control = this.mswipeForm.get(field);
					if (control instanceof UntypedFormControl) {
						control.markAsTouched({ onlySelf: true });
					}
				});

				this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);

			} else {

				this.paymentOptionValues = [];
				this.paymentOptionValues = this.mswipeForm.value;
				this.paymentOptionValues['receiptDate'] = globalFunctions.format(new Date(this.mswipeForm.get("mswipeReceiptDate").value), 'input');
				delete this.paymentOptionValues['mswipeReceiptDate'];
			}

			break;

			default:
		}

		if (errFound) {
			this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);
		} else if (errFound2) {
			this._snackBarMsgComponent.openSnackBar(allMsgs.PAY_AMT_MISMATCH, 'x', 'error-snackbar', 5000);
		} else {
			this.studentFeesSubmit();
		}
	}

	studentFeesSubmit(mode = '') {

		this.allEventEmitters.showLoader.emit(true);
		this._institutesService.studentFeesSubmit(this.studentId, this.totalFeesArray, this.miscInvoices, this.paymentOptionId, this.paymentOptionValues).subscribe(data => {

			this.allEventEmitters.showLoader.emit(false);

			if (data.status != undefined) {

				if (data.status == 1) {

					this.totalReceipts = data.dataJson;
					this.openPayFeesDialog( data.dataJson );

					localStorage.removeItem('localPeF');
					localStorage.removeItem('localMiscF');
					localStorage.removeItem('localAdmInvoices');
					localStorage.removeItem('seltdCardsCnt');

					this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'success-snackbar', 5000);

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

	thirdPartyFeesSubmit(mode = '') {

		this.allEventEmitters.showLoader.emit(true);
		this._thirdPartyService.feesSubmit(this.totalFeesArray, this.paymentOptionId, this.convenienceFeesAmt).subscribe(data => {

			this.allEventEmitters.showLoader.emit(false);

			if (data.status != undefined) {

				if (data.status == 1) {

					if (globalFunctions.isEmpty(data.dataJson.paymentTransactionId)) {

						this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);

					} else {

						globalFunctions.setLocalStorage('pTrId', data.dataJson.paymentTransactionId);

						window.location.href = data.dataJson.paymentUrl;
					}

				} else if (data.status == 0) {

					this.showCartPage = false;
					this.showEmptyCart = true;
					this.allEventEmitters.setCartIconCount.emit(0);
				}
			} else {
				this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
			}
		}, err => {
			this.allEventEmitters.showLoader.emit(false);
			this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
		});
	}

	feesSubmit(mode = '') {

		setTimeout(() => { this.allEventEmitters.showLoader.emit(true); }, 1);
		this._studentService.feesSubmit(this.totalFeesArray, this.miscInvoices, this.admissionInvoices, this.paymentOptionId, this.convenienceFeesAmt).subscribe(data => {

			setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);

			if (data.status != undefined) {

				if (data.status == 1) {

					if (mode == 'onProceedToPay') {

						if (globalFunctions.isEmpty(data.dataJson.paymentTransactionId)) {

							this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);

						} else {

							localStorage.removeItem('localPeF');
							localStorage.removeItem('localMiscF');
							localStorage.removeItem('localAdmInvoices');
							localStorage.removeItem('localPaF');
							localStorage.removeItem('localCoF');
							localStorage.removeItem('seltdCardsCnt');

							globalFunctions.setLocalStorage('pTrId', data.dataJson.paymentTransactionId);

							window.location.href = data.dataJson.paymentUrl;
						}

					} else {

						if (!globalFunctions.isEmpty(data.dataJson.convinienceOption)) {

							globalFunctions.setLocalStorage('localCoF', data.dataJson.convinienceOption);

							this.convenienceFeesArray = data.dataJson.convinienceOption;

							if (mode == 'onRemoveItem') {
								this.calcTotal('setLocalValues');
							} else {
								this.setValues();
							}
						} else {
							this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
						}
					}

				} else if (data.status == 0) {

					localStorage.removeItem('localPeF');
					localStorage.removeItem('localMiscF');
					localStorage.removeItem('localAdmInvoices');
					localStorage.removeItem('localPaF');
					localStorage.removeItem('localCoF');
					localStorage.removeItem('seltdCardsCnt');

					this.showCartPage = false;
					this.showEmptyCart = true;
					this.allEventEmitters.setCartIconCount.emit(0);
				}
			} else {
				this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
			}
		}, err => {
			setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);			
			this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
		});
	}

	admissionPayFees(mode = '') {

		this.allEventEmitters.showLoader.emit(true);
		this._admissionService.payFees(this.totalPayableAmount, this.paymentOptionId).subscribe(data => {

			this.allEventEmitters.showLoader.emit(false);

			if (data.status != undefined) {

				if (data.status == 1) {

					if (globalFunctions.isEmpty(data.dataJson.paymentTransactionId)) {

						this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);

					} else {

						globalFunctions.setLocalStorage('pTrId', data.dataJson.paymentTransactionId);

						window.location.href = data.dataJson.paymentUrl;
					}

				} else if (data.status == 101) {

					globalFunctions.setUserProf('applicantId', data.dataJson.newApplicantId);

					this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);

					this.router.navigate(['/admissionForm']);

				} else if (data.status == 0) {

					this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);

					if (data.dataJson.refreshCart) {
						this.listCart();							
					} else if (data.dataJson.formStatus == 0) {
						this.router.navigate(['/admissionForm']);
					}
				}
			} else {
				this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
			}
		}, err => {
			this.allEventEmitters.showLoader.emit(false);			
			this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
		});
	}

	atktPayFees() {

		this.allEventEmitters.showLoader.emit(true);
		this._atktService.payFees(this.paymentOptionId, this.totalPayableAmount).subscribe(data => {

			this.allEventEmitters.showLoader.emit(false);

			if (data.status != undefined) {
				if (data.status == 1) {
					globalFunctions.setLocalStorage('pTrId', data.dataJson.paymentTransactionId);
					window.location.href = data.dataJson.paymentUrl;
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

	redirectTo(path) {
		this.router.navigate([path]);
	}
	
	redirectToThirdParty() {
		window.location.href = this.redirectUrl;		
	}

	_openCashReceiptDatepicker(picker: MatDatepicker<Date>) {
		picker.open();
		setTimeout(() => this._cashReceiptDateInput.nativeElement.focus());
	}

	_closeCashReceiptDatepicker(e) {
		setTimeout(() => this._cashReceiptDateInput.nativeElement.blur());
	}

	_openDdReceiptDatepicker(picker: MatDatepicker<Date>) {
		picker.open();
		setTimeout(() => this._ddReceiptDateInput.nativeElement.focus());
	}

	_closeDdReceiptDatepicker(e) {
		setTimeout(() => this._ddReceiptDateInput.nativeElement.blur());
	}

	_openDdDatepicker(picker: MatDatepicker<Date>) {
		picker.open();
		setTimeout(() => this._ddDateInput.nativeElement.focus());
	}

	_closeDdDatepicker(e) {
		setTimeout(() => this._ddDateInput.nativeElement.blur());
	}

	_openChequeReceiptDatepicker(picker: MatDatepicker<Date>) {
		picker.open();
		setTimeout(() => this._chequeReceiptDateInput.nativeElement.focus());
	}

	_closeChequeReceiptDatepicker(e) {
		setTimeout(() => this._chequeReceiptDateInput.nativeElement.blur());
	}

	_openChequeDatePicker(picker: MatDatepicker<Date>) {
		picker.open();
		setTimeout(() => this._chequeDateInput.nativeElement.focus());
	}

	_closeChequeDatePicker(e) {
		setTimeout(() => this._chequeDateInput.nativeElement.blur());
	}

	_openNeftReceiptDatepicker(picker: MatDatepicker<Date>) {
		picker.open();
		setTimeout(() => this._neftReceiptDateInput.nativeElement.focus());
	}

	_closeNeftReceiptDatepicker(e) {
		setTimeout(() => this._neftReceiptDateInput.nativeElement.blur());
	}

	_openNeftDatepicker(picker: MatDatepicker<Date>) {
		picker.open();
		setTimeout(() => this._neftDateInput.nativeElement.focus());
	}

	_closeNeftDatepicker(e) {
		setTimeout(() => this._neftDateInput.nativeElement.blur());
	}

	_openMswipeReceiptDatepicker(picker: MatDatepicker<Date>) {
		picker.open();
		setTimeout(() => this._mswipeReceiptDateInput.nativeElement.focus());
	}

	_closeMswipeReceiptDatepicker(e) {
		setTimeout(() => this._mswipeReceiptDateInput.nativeElement.blur());
	}

	addUpdateFees(): void {
		this.onAddUpdateFees.emit('nitin');
	}

	openPayFeesDialog(element) {

		let dialogRef = this.dialog.open(ReceiptsDialogComponent, {
			height: '400px',
			width: '800px',
		});

		dialogRef.componentInstance.mode          = 'collect-fees';
		dialogRef.componentInstance.modalTitle    = 'View Receipts';
		dialogRef.componentInstance.receiptsArray = element;

		dialogRef.afterClosed().subscribe(result => {
		});

		this.dialogRef.close('loadPage');    
	}
}
