import { Component, OnInit } from '@angular/core';

import { SnackBarMsgComponent } from 'app-shared-components/snack-bar-msg/snack-bar-msg.component';

import { AllEventEmitters } from 'app/global/all-event-emitters';
import { environment } from 'environments/environment';

@Component({
	selector: 'cart',
	templateUrl: './cart.component.html',
	styleUrls: ['./cart.component.css'],
	providers: [SnackBarMsgComponent]  
})

export class CartComponent {

	formType: string = '';
	paymentOption: string = 'online';

	constructor( 
		private allEventEmitters: AllEventEmitters,
		public _snackBarMsgComponent: SnackBarMsgComponent,
	) {	

		this.allEventEmitters.setTitle.emit(
			environment.WEBSITE_NAME + ' - ' +
			environment.PANEL_NAME + 
			' | Cart'
		);
	}

}
