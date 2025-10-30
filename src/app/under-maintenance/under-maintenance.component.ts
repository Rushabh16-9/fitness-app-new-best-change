import { Component } from '@angular/core';
import { Settings } from 'app/app.settings.model';
import { AppSettings } from 'app/app.settings';

@Component({
  selector: 'under-maintenance',
  templateUrl: './under-maintenance.component.html',
  styleUrls: ['./under-maintenance.component.css']  
})
export class UnderMaintenanceComponent {

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
