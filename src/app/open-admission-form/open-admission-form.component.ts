import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';

import * as globalFunctions from 'app/global/globalFunctions';
import { AllEventEmitters } from 'app/global/all-event-emitters';
import { Settings } from 'app/app.settings.model';
import { AppSettings } from 'app/app.settings';

@Component({
  selector: 'open-admission-form',
  templateUrl: 'open-admission-form.component.html',
  styleUrls: ['open-admission-form.component.css'],
  providers: [],
  encapsulation: ViewEncapsulation.None
})
export class OpenAdmissionFormComponent implements OnInit {

  panelMode = 'admission';
  formDetails:any = {};
  dialogRef:any;

  public settings: Settings;

  headerImage: any = '';
  formPolicyId: any = 0;
  fromInstitute: boolean = false;
  showEnrollmentNumber: boolean = false;
  showTopNote: boolean = false;

  constructor(
    public appSettings:AppSettings,     
    private allEventEmitters: AllEventEmitters,    
  ) { 

    this.settings = this.appSettings.settings;

    if (!globalFunctions.isEmpty(globalFunctions.getUserProf('instituteId'))) {

      let userProf = globalFunctions.getUserProf();
      this.headerImage = userProf.headerImage;
      this.formPolicyId = userProf.formPolicyId;

      if (this.formPolicyId == 1) {
        this.showEnrollmentNumber = true;
      }

      this.fromInstitute = true;
    }
  }

  ngOnInit(): void {

  }

  ngAfterViewInit():void {

    setTimeout(() => { this.settings.loadingSpinner = false }, 300);
  }  
}
