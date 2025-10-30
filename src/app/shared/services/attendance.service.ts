import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

import { attendanceApiUrls } from 'app/resta-api-urls';
import * as globalFunctions from 'app/global/globalFunctions';

@Injectable()
export class AttendanceService {

  constructor(
    private http: HttpClient
  ) {}

  getExistingSchedule(courseScheduleInfo, scheduleId = '') : Observable<any> {

    const url = attendanceApiUrls.getExistingSchedule;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['selectedLevels'] = courseScheduleInfo.selectedLevels;
    postData['scheduleType'] = courseScheduleInfo.scheduleType;      
    postData['fromDate'] = courseScheduleInfo.fromDate;      
    postData['toDate'] = courseScheduleInfo.toDate;
    postData['scheduleId'] = scheduleId;

    return this.http.post<any>(url, postData);
  }

  saveSchedule(schedules) : Observable<any> {

    const url = attendanceApiUrls.saveSchedule;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['schedules'] = schedules;

    return this.http.post<any>(url, postData);
  }

  getAllSchedules() : Observable<any> {

    const url = attendanceApiUrls.getAllSchedules;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    
    return this.http.post<any>(url, postData);
  }

  deleteSchedule(scheduleId) : Observable<any> {

    const url = attendanceApiUrls.deleteSchedule;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['scheduleId'] = scheduleId;

    return this.http.post<any>(url, postData);
  }

  getAllLectures(page, filter = '', dateRange) : Observable<any> {
    
    const url = attendanceApiUrls.getAllLectures;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(page, dateRange, filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);

    return this.http.post<any>(url, postData);
  }

  cancelLecture(lectureId, cancelledReason = '') : Observable<any> {

    const url = attendanceApiUrls.cancelLecture;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['lectureId'] = lectureId;
    postData['cancelledReason'] = cancelledReason;

    return this.http.post<any>(url, postData);
  }
  
  getLectureStudents(lectureId) : Observable<any> {

    const url = attendanceApiUrls.getLectureStudents;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['lectureId'] = lectureId;

    return this.http.post<any>(url, postData);
  }

  markAttendance(lectureId, attendanceInfo) : Observable<any> {

    const url = attendanceApiUrls.markAttendance;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['lectureId'] = lectureId;
    postData['attendanceInfo'] = attendanceInfo;

    return this.http.post<any>(url, postData);
  }

  getAttdDashboard(page, dateRange, filter = '') : Observable<any> {

    const url = attendanceApiUrls.getAttdDashboard;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(page, dateRange, filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);

    return this.http.post<any>(url, postData);
  }

  getDailyAttdReport(page, dateRange, filter = '', selectedConfIds = [], totalRequiredPercentage = '') : Observable<any> {
    
    const url = attendanceApiUrls.getDailyAttdReport;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(page, dateRange, filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['confIds'] = selectedConfIds;
    postData['totalRequiredPercentage'] = totalRequiredPercentage;
    
    return this.http.post<any>(url, postData);
  }
  
  getDailyAttdReportExcel(page, dateRange, filter = '', selectedConfIds = [], totalRequiredPercentage = '') : Observable<any> {
    
    const url = attendanceApiUrls.getDailyAttdReportExcel;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(page, dateRange, filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['confIds'] = selectedConfIds;
    postData['totalRequiredPercentage'] = totalRequiredPercentage;

    return this.http.post<Blob>(url, postData, { responseType: 'blob' as 'json' } ).pipe(timeout(globalFunctions.timeoutSeconds()));
  }

  getLectureWiseAttdReport(page, dateRange, filter, selectedConfId, totalRequiredPercentage = '') : Observable<any> {
    
    const url = attendanceApiUrls.getDaywiseLectureAttd;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(page, dateRange, filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['confId'] = selectedConfId;
    postData['totalRequiredPercentage'] = totalRequiredPercentage;

    return this.http.post<any>(url, postData);
  }

  getLectureWiseAttdReportExcel(page, dateRange, filter, selectedConfId = [], totalRequiredPercentage = '') : Observable<any> {
    
    const url = attendanceApiUrls.getDaywiseLectureAttdExcel;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(page, dateRange, filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['confId'] = selectedConfId;
    postData['totalRequiredPercentage'] = totalRequiredPercentage;

    return this.http.post<Blob>(url, postData, { responseType: 'blob' as 'json' } ).pipe(timeout(globalFunctions.timeoutSeconds()));
  }  
}
