import { Component } from '@angular/core';
import { Settings } from 'app/app.settings.model';
import { AppSettings } from 'app/app.settings';

@Component({
  selector: 'no-access',
  templateUrl: './no-access.component.html'
})
export class NoAccessComponent {

  public settings:Settings;

  constructor(
    public appSettings:AppSettings,   	
  ) {

    this.settings = this.appSettings.settings;
  }

  ngAfterViewInit(){
    setTimeout(() => { this.settings.loadingSpinner = false }, 300)  
  }
}
