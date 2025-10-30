import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';

import * as globalFunctions from 'app/global/globalFunctions';
import { environment } from 'environments/environment';
import { AllEventEmitters } from 'app/global/all-event-emitters';

@Component({
  selector: 'admission-form-b',
  templateUrl: 'admission-form-b.component.html',
  styleUrls: ['admission-form-b.component.css'],
  providers: [],
  encapsulation: ViewEncapsulation.None
})
export class AdmissionFormBComponent implements OnInit {

  panelMode = 'admission-form-b';
  formDetails:any = {};
  dialogRef:any;

  headerImage: any = '';
  formPolicyId: any = 0;
  fromInstitute: boolean = false;
  showEnrollmentNumber: boolean = false;
  showTopNote: boolean = false;

  constructor(
    private allEventEmitters: AllEventEmitters    
  ) { 

    this.allEventEmitters.setTitle.emit(
      environment.WEBSITE_NAME + ' - ' +
      environment.PANEL_NAME + 
      ' | Admission Form B'
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
