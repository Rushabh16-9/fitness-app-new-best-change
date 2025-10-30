import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

import * as globalFunctions from 'app/global/globalFunctions';
import * as allMsgs from 'app/global/allMsgs';

import { AllEventEmitters } from 'app/global/all-event-emitters';
import { SnackBarMsgComponent } from 'app-shared-components/snack-bar-msg/snack-bar-msg.component';
import { environment } from 'environments/environment';

@Component({
  selector: 'course-selection',
  styleUrls: ['course-selection.component.css'],
  templateUrl: './course-selection.component.html',
  providers: [SnackBarMsgComponent]
})
export class CourseSelectionComponent implements OnInit {

  panelMode = 'course-selection';

  allMsgs: any = allMsgs;
  headerImage: string = '';
  fromInstitute: boolean = false;
  
  constructor(
    public _snackBarMsgComponent: SnackBarMsgComponent, 
    private allEventEmitters: AllEventEmitters
    ) {

    if (!globalFunctions.isEmpty(globalFunctions.getUserProf('instituteId'))) {
      this.fromInstitute = true;      
      this.headerImage = globalFunctions.getUserProf('headerImage');
    }

    this.allEventEmitters.setTitle.emit(
      environment.WEBSITE_NAME + ' - ' +
      environment.PANEL_NAME + 
      ' | Course Selection'
    );
  }

  ngOnInit() {

  }

}