import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

import { pdfApiUrls } from 'app/resta-api-urls';
import * as globalFunctions from 'app/global/globalFunctions';

@Injectable()
export class PdfService {

  constructor(
    private http: HttpClient
  ) {}

  getReport(postParam, reportName:string) : Observable<any> {

    const url = pdfApiUrls.getReport;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['postParam'] = postParam;
    postData['reportName'] = reportName;

    return this.http.post<any>(url, postData).pipe(timeout(globalFunctions.timeoutSeconds()));
  }
}
