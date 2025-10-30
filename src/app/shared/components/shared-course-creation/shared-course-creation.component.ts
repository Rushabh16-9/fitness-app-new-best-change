import { Component, OnInit, ViewEncapsulation, ViewChild, Inject, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

import { SnackBarMsgComponent } from 'app-shared-components/snack-bar-msg/snack-bar-msg.component';
import { InstituteMasterService } from 'app-shared-services/instituteMaster.service';
import { AdminService } from 'app-shared-services/admin.service';
import { InstitutesService } from 'app-shared-services/institutes.service';

import { CourseCreationDialogComponent } from './course-creation-dialog/course-creation-dialog.component';
import { GroupSubjectsDialogComponent } from './group-subjects-dialog/group-subjects-dialog.component';
import { ExamTermDialogComponent } from './exam-term-dialog/exam-term-dialog.component';

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
	selector: 'shared-course-creation',
	templateUrl: './shared-course-creation.component.html',
	styleUrls: ['./shared-course-creation.component.css'],
	providers: [
		SnackBarMsgComponent, 
		InstituteMasterService,
		InstitutesService,
		AdminService,
	],
  	encapsulation: ViewEncapsulation.None	
})

export class SharedCourseCreationComponent implements OnInit {

	@Input('page') page;
	@Input('instituteId') instituteId;
	@Input('dialogRef') dialogRef;

	@Output() onAddUpdateFees:EventEmitter<any> = new EventEmitter();

	globalFunctions: any = globalFunctions;
	allMsgs: any = allMsgs;

	@ViewChild('table', { static: true }) table: any;
	showBankAccountsOverlay: boolean = false;
	tableData:any;
	tempData:any;
	columns = [];
	pagination = {
		pageStart: 0,
		pageEnd: 0,
		limit: 5,
		totalRecords: 0,
		offset: 0,
		orderBy: '',
		orderDir: ''
	};
  	rowsPerPageArray = [5, 10, 15, 20]; 

  	institutesList = [];
  	instituteIds = new FormControl();

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
		this.getListOfInstituteCourses();
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

	getListOfInstituteCourses() {

		this.tableData = [];
		this.tempData = [];

		this.showBankAccountsOverlay = true;
		this._instituteMasterService.getListOfInstituteCourses(this.instituteId).subscribe(data => {

			this.showBankAccountsOverlay = false;

			if (data.status != undefined) {
				if (data.status == 1) {
					if (data.dataJson) {            
						this.tempData = [...data.dataJson];
						this.tableData = data.dataJson;
						setTimeout(() => { this.table.rowDetail.expandAllRows(); }, 2);
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

	toggleExpandRow(row) {
		this.table.rowDetail.toggleExpandRow(row);
	}

	changeRows(limit) {
		this.pagination.offset = 0;
		this.pagination.limit = limit;
	}

	onInputSearch(event) {
		let updateFilterValues = globalFunctions.updateFilter(event, this.tableData, this.tempData, this.columns, this.table);
		this.tableData = updateFilterValues.tableData;
		this.tempData = updateFilterValues.tempData;
		this.columns = updateFilterValues.columnsData;
		this.table = updateFilterValues.table;
	}

	onViewExamTerm(row:any = {}) {

		let dialogRef = this.dialog.open(ExamTermDialogComponent, {
			panelClass: 'fullscreen-dialog',
			autoFocus: false
		});

		dialogRef.componentInstance.modalTitle  = 'Exam Terms - ' + row.courseTitle;
		dialogRef.componentInstance.instituteId = this.instituteId;
		dialogRef.componentInstance.rowDetails  = row;
		dialogRef.componentInstance.dialogRef   = dialogRef;
		dialogRef.componentInstance.permissions = this.authService.getPermissions();

		dialogRef.afterClosed().subscribe(result => {
			if (result == 'loadPage') {
				this.getListOfInstituteCourses();
			}
		});
	}

	onViewGroupSubjects(row:any = {}) {

		let dialogRef = this.dialog.open(GroupSubjectsDialogComponent, {
			panelClass: 'fullscreen-dialog',
			autoFocus: false
		});

		dialogRef.componentInstance.modalTitle  = 'Group Subjects - ' + row.courseTitle;
		dialogRef.componentInstance.instituteId = this.instituteId;
		dialogRef.componentInstance.rowDetails  = row;
		dialogRef.componentInstance.dialogRef   = dialogRef;
		dialogRef.componentInstance.permissions = this.authService.getPermissions();

		dialogRef.afterClosed().subscribe(result => {
			if (result == 'loadPage') {
				this.getListOfInstituteCourses();
			}
		});
	}

	onAddEditCourse(mode, row:any = {}) {

		let dialogRef = this.dialog.open(CourseCreationDialogComponent, {
			width: '600px',
			height: 'auto',
			autoFocus: false
		});

		let modalTitle = '';
		if (mode == 'add') {
			row.leaveTypeId = 0;
			modalTitle = 'Add Course';
		} else if (mode == 'edit') {
			modalTitle = 'Edit Course';
		}

		dialogRef.componentInstance.page        = this.page;
		dialogRef.componentInstance.modalTitle  = modalTitle;
		dialogRef.componentInstance.mode        = mode;
		dialogRef.componentInstance.instituteId = this.instituteId;
		dialogRef.componentInstance.rowDetails  = row;
		dialogRef.componentInstance.dialogRef   = dialogRef;

		dialogRef.afterClosed().subscribe(result => {
			if (result == 'loadPage') {
				this.getListOfInstituteCourses();
			}
		});
	}

	onDeleteCourse(row: any) {

		row.instituteId = this.instituteId;

		if (globalFunctions.isEmpty(row.confId)) {
			alert('confId not found');
		} else if (globalFunctions.isEmpty(row.instituteId)) {
			alert('instituteId not found');
		} else {

			let dialogRef = this.dialog.open(ConfirmDialogComponent, {
				width: '500px',
				height: 'auto',
				autoFocus: false
			});

			dialogRef.componentInstance.modalTitle = "Are you sure you want to delete Conf: Id "+row.confId + " ?";
			dialogRef.componentInstance.yesText = 'OK';
			dialogRef.componentInstance.noText = 'CLOSE';
			dialogRef.componentInstance.dialogRef = dialogRef;

			dialogRef.afterClosed().subscribe(result => {
				if (result == 'ok') {
					this.deleteCourse(row);
				}
			});
		}
	}

	deleteCourse(row) {

		this.allEventEmitters.showLoader.emit(true);
		this._instituteMasterService.deleteCourse(row).subscribe(data => {

			this.allEventEmitters.showLoader.emit(false);

			if (data.status != undefined) {
				if (data.status == 1) {
					this.getListOfInstituteCourses();
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

	onChangeInstitute() {
		this.pagination.offset = 0;
		this.instituteId = this.instituteIds.value;
		this.getListOfInstituteCourses();
	}

}
