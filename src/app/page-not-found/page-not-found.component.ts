import { Component } from '@angular/core';
import { Settings } from 'app/app.settings.model';
import { AppSettings } from 'app/app.settings';

@Component({
  selector: 'app-not-found',
  templateUrl: './page-not-found.component.html'
})
export class PageNotFoundComponent {

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
