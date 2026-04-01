import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';

import * as globalFunctions from 'app/global/globalFunctions';
import { environment } from 'environments/environment';
import { AllEventEmitters } from 'app/global/all-event-emitters';
import { SharedAdmissionFormComponent } from 'app/shared/components/shared-admission-form/shared-admission-form.component';

@Component({
  selector: 'admission-form',
  templateUrl: 'admission-form.component.html',
  styleUrls: ['admission-form.component.css'],
  providers: [],
  encapsulation: ViewEncapsulation.None
})
export class AdmissionFormComponent implements OnInit {

  @ViewChild(SharedAdmissionFormComponent) sharedAdmissionForm!: SharedAdmissionFormComponent;

  panelMode = 'admission';
  formDetails: any = {};

  headerImage: any = '';
  formPolicyId: any = 0;
  fromInstitute: boolean = false;
  showEnrollmentNumber: boolean = false;
  showTopNote: boolean = false;
  showHeaderImage: boolean = false;

  constructor(
    private allEventEmitters: AllEventEmitters
  ) {

    this.allEventEmitters.setTitle.emit(
      environment.WEBSITE_NAME + ' - ' +
      environment.PANEL_NAME +
      ' | Admission Form'
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
      (flag: boolean) => {
        if (flag) {
          let userProf = globalFunctions.getUserProf();
          this.headerImage = userProf.headerImage;
        }
      }
    );

    if (!globalFunctions.isEmpty(this.headerImage)) {
      this.showHeaderImage = true;
    }

  }

  ngOnInit(): void {
    // Upload popup is now triggered from SharedAdmissionFormComponent
  }

}
