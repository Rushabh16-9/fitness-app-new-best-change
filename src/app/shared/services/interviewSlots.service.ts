import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { interviewSlotsApiUrls } from 'app/resta-api-urls';
import * as globalFunctions from 'app/global/globalFunctions';

@Injectable()
export class InterviewSlotsService {

  constructor(
    private http: HttpClient
  ) {}

  getScheduleSlots() : Observable<any> {

    const url = interviewSlotsApiUrls.getScheduleSlots;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }

  bookSlot(values:any): Observable<any> {

    const url = interviewSlotsApiUrls.bookSlot;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['date'] = values.date;
    postData['fromTime'] = values.fromTime;
    postData['toTime'] = values.toTime;

    return this.http.post<any>(url, postData);
  }

}
