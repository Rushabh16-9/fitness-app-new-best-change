import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { BreakpointObserver } from '@angular/cdk/layout';
import * as globalFunctions from 'app/global/globalFunctions';

import { AppSettings } from './app.settings';
import { Settings } from './app.settings.model';
import { AllEventEmitters } from './global/all-event-emitters';
import { DeviceDetectorService } from 'ngx-device-detector';

import { AuthService } from './auth/auth.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	providers: [
		DeviceDetectorService
	]
})
export class AppComponent {

	public settings: Settings;

	public preloader: boolean = true;
	public ajax_preloader: boolean = false;
	private _preloader_selector: string = 'preloader';
	private _preloader_element: HTMLElement;
	isMobile: boolean = false;

	deviceInfo = null;

	constructor(
		public appSettings: AppSettings,
		private deviceService: DeviceDetectorService,
		private router: Router,
		private allEventEmitters: AllEventEmitters,
		private authService: AuthService,
		private titleService: Title,
		private breakpointObserver: BreakpointObserver,
	) {
		this.settings = this.appSettings.settings;

		this.deviceInfo = this.deviceService.getDeviceInfo();

		const validBrowsers = {
			"ie": 11,
			"firefox": 40,
			"chrome": 40,
			"opera": 41,
			"ms-edge": 14,
			"safari": 10,
		}

		if ((this.deviceInfo.browser == 'ie' && parseInt(this.deviceInfo.browser_version) < 11) ||
			(this.deviceInfo.browser == 'firefox' && parseInt(this.deviceInfo.browser_version) < 40) ||
			(this.deviceInfo.browser == 'chrome' && parseInt(this.deviceInfo.browser_version) < 40) ||
			(this.deviceInfo.browser == 'opera' && parseInt(this.deviceInfo.browser_version) < 41) ||
			(this.deviceInfo.browser == 'ms-edge' && parseInt(this.deviceInfo.browser_version) < 14) ||
			(this.deviceInfo.browser == 'safari' && parseInt(this.deviceInfo.browser_version) < 10)
		) {
			this.router.navigate(['/browser-error']);
		}

		let _self = this;
		allEventEmitters.showLoader.subscribe(
			(flag: boolean) => {
				this.ajax_preloader = flag;
			}
		);

		allEventEmitters.setTitle.subscribe(
			(newTitle: string) => {
				this.titleService.setTitle(newTitle);
			}
		);
	}

	ngOnInit(): void {
		this.authService.getConfig();

		this.isMobile = this.breakpointObserver.isMatched('(max-width: 768px)');
		globalFunctions.setLocalStorage('isMobile', this.isMobile);
	}

	ngAfterViewInit(): void {
		// hide spinner once all loaders are completed
		// this._preloader_element.style['display'] = 'none';
		setTimeout(() => { this.preloader = false; }, 300);
	}
}