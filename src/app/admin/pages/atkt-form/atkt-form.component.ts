import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';

import * as globalFunctions from 'app/global/globalFunctions';
import { environment } from 'environments/environment';
import { AllEventEmitters } from 'app/global/all-event-emitters';

@Component({
  selector: 'atkt-form',
  templateUrl: 'atkt-form.component.html',
  styleUrls: ['atkt-form.component.css'],
  providers: [],
  encapsulation: ViewEncapsulation.None
})
export class AtktFormComponent implements OnInit {

  panelMode = 'admission';
  formDetails:any = {};
  dialogRef:any;

  headerImage: any = '';
  formPolicyId: any = 0;
  fromInstitute: boolean = false;
  showEnrollmentNumber: boolean = false;

  constructor(
    private allEventEmitters: AllEventEmitters    
  ) { 

    this.allEventEmitters.setTitle.emit(
      environment.WEBSITE_NAME + ' - ' +
      environment.PANEL_NAME + 
      ' | ATKT Form'
    );

    if (!globalFunctions.isEmpty(globalFunctions.getUserProf('instituteId'))) {

      let userProf = globalFunctions.getUserProf();
      this.headerImage = userProf.headerImage;
      this.formPolicyId = userProf.formPolicyId;

      if (this.formPolicyId == 1) {
        this.showEnrollmentNumber = true;
      }

      this.fromInstitute = true;
    }

    allEventEmitters.setHeaderImage.subscribe(
      (flag:boolean) => {
        if (flag) {
          let userProf = globalFunctions.getUserProf();          
          this.headerImage = userProf.headerImage;
        }
      }
    );
  }

  ngOnInit(): void {

  }
}
