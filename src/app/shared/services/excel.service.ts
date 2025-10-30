import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

import { excelApiUrls } from 'app/resta-api-urls';
import * as globalFunctions from 'app/global/globalFunctions';

@Injectable()
export class ExcelService {

  constructor(
    private http: HttpClient
  ) {}

  getStudentBulkExcelTemplate(selectedLevels) : Observable<any> {

    const url = excelApiUrls.getStudentBulkExcelTemplate;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['selectedLevels'] = selectedLevels;

    return this.http.post<any>(url, postData);
  }

  uploadStudentsBulkExcel(selectedLevels, subjectGroupId, currentAcademicYearId, admissionYearId, fileName, instituteFeesIds) : Observable<any> {

    const url = excelApiUrls.uploadStudentsBulkExcel;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['selectedLevels'] = selectedLevels;
    postData['subjectGroupId'] = subjectGroupId;
    postData['currentAcademicYearId'] = currentAcademicYearId;
    postData['admissionYearId'] = admissionYearId;
    postData['fileName'] = fileName;
    postData['instituteFeesIds'] = instituteFeesIds;

    return this.http.post<any>(url, postData).pipe(timeout(globalFunctions.timeoutSeconds()));
  }

}
