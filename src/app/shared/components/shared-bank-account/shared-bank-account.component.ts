import { Component, OnInit, ViewEncapsulation, ViewChild, Inject, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

import { SnackBarMsgComponent } from 'app-shared-components/snack-bar-msg/snack-bar-msg.component';
import { InstituteMasterService } from 'app-shared-services/instituteMaster.service';
import { AdminService } from 'app-shared-services/admin.service';
import { InstitutesService } from 'app-shared-services/institutes.service';

import { BankAccountDialogComponent } from './bank-account-dialog/bank-account-dialog.component';
import { ApproveRejectDialogComponent } from './approve-reject-dialog/approve-reject-dialog.component';
import { ConfirmDialogComponent } from 'app-shared-components/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

import { AllEventEmitters } from 'app/global/all-event-emitters';

import * as globalFunctions from 'app/global/globalFunctions';
import * as allMsgs from 'app/global/allMsgs';

import { AuthService } from 'app/auth/auth.service';

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
	selector: 'shared-bank-account',
	templateUrl: './shared-bank-account.component.html',
	styleUrls: ['./shared-bank-account.component.css'],
	providers: [
		SnackBarMsgComponent, 
		InstituteMasterService,
		InstitutesService,
		AdminService,
	],
  	encapsulation: ViewEncapsulation.None	
})

export class SharedBankAccountComponent implements OnInit {

	@Input('page') page;
	@Input('instituteId') instituteId;
	@Input('dialogRef') dialogRef;

	@Output() onAddUpdateFees:EventEmitter<any> = new EventEmitter();

	globalFunctions: any = globalFunctions;
	allMsgs: any = allMsgs;

	@ViewChild('bankAccountsTable', { static: true }) bankAccountsTable: any;  
	showBankAccountsOverlay: boolean = false;
	bankAccountsArray:any;
	bankAccountsTempArray:any;
	bankAccountsColumns = [];
	bankAccountsPage = {
		pageStart: 0,
		pageEnd: 0,
		limit: 5,
		totalRecords: 0,
		offset: 0,
		orderBy: '',
		orderDir: ''
	};
	bankAccountsFilter: string;
  	rowsPerPageArray = [5, 10, 15, 20]; 

  	institutesList = [];
  	instituteIds = new FormControl();

	approvalStatus = new FormControl();

	canAdd: boolean = false;
	canEdit: boolean = false;
	canDelete: boolean = false;
	canExport: boolean = false;

	userTypeId: string;
	instituteName: string;

	constructor( 
    	public dialog: MatDialog,
		private allEventEmitters: AllEventEmitters,
		public _snackBarMsgComponent: SnackBarMsgComponent,
    	private authService: AuthService, 		
    	private _instituteMasterService: InstituteMasterService, 		
    	private _institutesService: InstitutesService, 
    	private _adminService: AdminService, 		
	) {	

	}

	ngOnInit(): void {

		let permissions = this.authService.getPermissions();
		this.canAdd     = permissions.add;
		this.canEdit    = permissions.edit;
		this.canDelete  = permissions.delete;
		this.canExport  = permissions.export;

	    let userProf = globalFunctions.getUserProf();
		this.userTypeId = userProf.userTypeId;
		// userTypeId
		// 1 = Admin 
		// 2 = Institute
		// 3 = Student
		// 5 = Admission

	    this.getInstitutesList();    
		this.callPageApi();
	}

	public getInstitutesList():void {

		this._institutesService.getInstitutesList().subscribe(data => {

			if (data.status != undefined) {
				if (data.status == 1) {
					this.institutesList = data.dataJson;
				} else if (data.status == 0) {
					this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar');
				}
			} else {
				this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
			}
		}, err => {
			this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
		});
	}

	callPageApi() {

		if (this.page == 'admin') {
			this.adminGetListOfBankAccounts();
		} else if (this.page == 'institute') {
			this.getListOfBankAccounts();
		}
	}

	adminGetListOfBankAccounts() {

		this.bankAccountsArray = [];
		this.bankAccountsTempArray = [];

		this.showBankAccountsOverlay = true;
		this._adminService.getListOfBankAccounts(this.instituteIds.value, this.approvalStatus.value).subscribe(data => {

			this.showBankAccountsOverlay = false;

			if (data.status != undefined) {
				if (data.status == 1) {
					if (data.dataJson) {            
						this.bankAccountsTempArray = [...data.dataJson];
						this.bankAccountsArray = data.dataJson;
						setTimeout(() => { this.bankAccountsTable.rowDetail.expandAllRows(); }, 2);
					}
				}
			} else {
				this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
			}
		}, err => {
			this.showBankAccountsOverlay = false;
			this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
		});
	}

	getListOfBankAccounts() {

		this.bankAccountsArray = [];
		this.bankAccountsTempArray = [];

		this.showBankAccountsOverlay = true;
		this._instituteMasterService.getListOfBankAccounts(this.instituteId).subscribe(data => {

			this.showBankAccountsOverlay = false;

			if (data.status != undefined) {
				if (data.status == 1) {
					if (data.dataJson) {            
						this.bankAccountsTempArray = [...data.dataJson];
						this.bankAccountsArray = data.dataJson;
						setTimeout(() => { this.bankAccountsTable.rowDetail.expandAllRows(); }, 2);          
					}
				}
			} else {
				this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
			}
		}, err => {
			this.showBankAccountsOverlay = false;
			this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
		});
	}

	bankAccountsToggleExpandRow(row) {
		this.bankAccountsTable.rowDetail.toggleExpandRow(row);
	}

	bankAccountsChangeRows(limit) {
		this.bankAccountsPage.offset = 0;
		this.bankAccountsPage.limit = limit;
	}

	onInputSearchBankAccounts(event) {
		let updateFilterValues = globalFunctions.updateFilter(event, this.bankAccountsArray, this.bankAccountsTempArray, this.bankAccountsColumns, this.bankAccountsTable);
		this.bankAccountsArray = updateFilterValues.tableData;
		this.bankAccountsTempArray = updateFilterValues.tempData;
		this.bankAccountsColumns = updateFilterValues.columnsData;
		this.bankAccountsTable = updateFilterValues.table;
	}

	onAddEditBankAccounts(mode, row:any = {}) {

		let dialogRef = this.dialog.open(BankAccountDialogComponent, {
			width: '600px',
			height: 'auto',
			autoFocus: false
		});

		let modalTitle = '';
		if (mode == 'add') {
			row.leaveTypeId = 0;
			modalTitle = 'Add Bank Account';
		} else if (mode == 'edit') {
			modalTitle = 'Edit Bank Account';
		}

		dialogRef.componentInstance.page        = this.page;
		dialogRef.componentInstance.modalTitle  = modalTitle;
		dialogRef.componentInstance.mode        = mode;
		dialogRef.componentInstance.instituteId = this.instituteId;
		dialogRef.componentInstance.rowDetails  = row;
		dialogRef.componentInstance.dialogRef   = dialogRef;

		dialogRef.afterClosed().subscribe(result => {
			if (result == 'loadPage') {
				this.callPageApi();
			}
		});
	}

	onDeleteBankAccounts(row: any) {

		if (globalFunctions.isEmpty(row.bankAccountId)) {
			alert('bankAccountId not found');
		} else if (globalFunctions.isEmpty(row.instituteId)) {
			alert('instituteId not found');
		} else {

			let dialogRef = this.dialog.open(ConfirmDialogComponent, {
				width: '500px',
				height: 'auto',
				autoFocus: false
			});

			dialogRef.componentInstance.modalTitle = "Are you sure you want to delete Bank Account: Id "+row.bankAccountId + " ?";
			dialogRef.componentInstance.yesText = 'OK';
			dialogRef.componentInstance.noText = 'CLOSE';
			dialogRef.componentInstance.dialogRef = dialogRef;

			dialogRef.afterClosed().subscribe(result => {
				if (result == 'ok') {
					this.deleteBankAccount(row.bankAccountId, row.instituteId);
				}
			});
		}
	}

	deleteBankAccount(bankAccountId: number, instituteId: number) {

		this.allEventEmitters.showLoader.emit(true);
		this._instituteMasterService.deleteBankAccount(bankAccountId, instituteId).subscribe(data => {

			this.allEventEmitters.showLoader.emit(false);

			if (data.status != undefined) {
				if (data.status == 1) {
					this.callPageApi();
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

	onSelectDefault(row) {

		if (globalFunctions.isEmpty(row.bankAccountId)) {
			alert('bankAccountId not found');
		} else if (globalFunctions.isEmpty(row.instituteId)) {
			alert('instituteId not found');
		} else {

			let dialogRef = this.dialog.open(ConfirmDialogComponent, {
				width: '500px',
				height: 'auto',
				autoFocus: false
			});

			dialogRef.componentInstance.modalTitle = "Are you sure you want to set Bank Account: Id "+row.bankAccountId + " to Default?";
			dialogRef.componentInstance.yesText = 'OK';
			dialogRef.componentInstance.noText = 'CLOSE';
			dialogRef.componentInstance.dialogRef = dialogRef;

			dialogRef.afterClosed().subscribe(result => {
				if (result == 'ok') {
					this.setDefaultBankAccount(row.bankAccountId, row.instituteId);
				}
			});
		}    
	}

	setDefaultBankAccount(bankAccountId: number, instituteId: number) {

		this.allEventEmitters.showLoader.emit(true);
		this._instituteMasterService.setDefaultBankAccount(bankAccountId, instituteId).subscribe(data => {

			this.allEventEmitters.showLoader.emit(false);

			if (data.status != undefined) {
				if (data.status == 1) {
					this.callPageApi();
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

	onApproveRejectBankAccount(type, row) {

		if (globalFunctions.isEmpty(row.bankAccountId)) {
			alert('bankAccountId not found');
		} else if (globalFunctions.isEmpty(row.instituteId)) {
			alert('instituteId not found');
		} else {

			let dialogRef = this.dialog.open(ApproveRejectDialogComponent, {
				width: '500px',
				height: 'auto',
				autoFocus: false
			});

			let modalTitle = '';
			if (type == 'approve') {
				row.leaveTypeId = 0;
				modalTitle = "Approve Bank Account: Id "+row.bankAccountId;
			} else if (type == 'reject') {
				modalTitle = "Reject Bank Account: Id "+row.bankAccountId;
			}

			dialogRef.componentInstance.modalTitle = modalTitle;
			dialogRef.componentInstance.type       = type;
			dialogRef.componentInstance.rowDetails = row;
			dialogRef.componentInstance.dialogRef  = dialogRef;

			dialogRef.afterClosed().subscribe(result => {
				if (result == 'loadPage') {
					this.callPageApi();
				}
			});
		}
	}

	onChangeInstitute() {
		this.bankAccountsPage.offset = 0;
		this.callPageApi();
	}

	onChangeStatus() {
		this.bankAccountsPage.offset = 0;
		this.callPageApi();
	}
}
