import { Component, OnInit } from '@angular/core';

import { SnackBarMsgComponent } from 'app-shared-components/snack-bar-msg/snack-bar-msg.component';

import { Settings } from 'app/app.settings.model';
import { AppSettings } from 'app/app.settings';

import { AllEventEmitters } from 'app/global/all-event-emitters';
import { environment } from 'environments/environment';

@Component({
	selector: 'open-cart',
	templateUrl: './open-cart.component.html',
	styleUrls: ['./open-cart.component.css'],
	providers: [SnackBarMsgComponent]
})

export class OpenCartComponent implements OnInit {

	formType: string = 'openCart';
	paymentOption: string = 'online';
  	public settings:Settings;

	constructor( 
    	public appSettings:AppSettings, 		
		private allEventEmitters: AllEventEmitters,
		public _snackBarMsgComponent: SnackBarMsgComponent,
	) {	
		this.allEventEmitters.setTitle.emit(
			environment.WEBSITE_NAME + ' - ' +
			environment.PANEL_NAME + 
			' | Open Cart'
		);

	    this.settings = this.appSettings.settings;
	}

	ngOnInit(): void {

	}

  	ngAfterViewInit() {
    	setTimeout(() => { this.settings.loadingSpinner = false }, 300)  
	}

}
