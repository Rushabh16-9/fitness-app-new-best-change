import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { DeviceDetectorService } from 'ngx-device-detector';

import { AllEventEmitters } from 'app/global/all-event-emitters';
import { environment } from 'environments/environment';

@Component({
  selector: 'browser-error',
  templateUrl: './browser-error.component.html',
  styleUrls: ['./browser-error.component.css']
})
export class BrowserErrorComponent implements OnInit {

  deviceInfo = null;
  detectedBrowser = 'Unknown';

  constructor(
    private deviceService: DeviceDetectorService,
    private router: Router,
    private allEventEmitters: AllEventEmitters
  ) { 

    this.deviceInfo = this.deviceService.getDeviceInfo();

    this.detectedBrowser = this.deviceInfo.browser + ' v'+ this.deviceInfo.browser_version;

    if ((this.deviceInfo.browser == 'ie' && parseInt(this.deviceInfo.browser_version) > 11) ||
        (this.deviceInfo.browser == 'firefox' && parseInt(this.deviceInfo.browser_version) > 40) ||
        (this.deviceInfo.browser == 'chrome' && parseInt(this.deviceInfo.browser_version) > 40) ||
        (this.deviceInfo.browser == 'opera' && parseInt(this.deviceInfo.browser_version) > 41) ||
        (this.deviceInfo.browser == 'ms-edge' && parseInt(this.deviceInfo.browser_version) > 14) ||
        (this.deviceInfo.browser == 'safari' && parseInt(this.deviceInfo.browser_version) > 10)
    ) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {

    this.allEventEmitters.setTitle.emit(
      environment.WEBSITE_NAME + ' - ' +
      environment.PANEL_NAME + 
      ' | Browser Error'
    );
  }

}
