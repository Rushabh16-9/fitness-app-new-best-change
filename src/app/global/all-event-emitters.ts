import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class AllEventEmitters {
	setTitle: EventEmitter<string>                   = new EventEmitter();
	showLoader: EventEmitter<boolean>                = new EventEmitter();
	setLeftSideUserInfoBlock: EventEmitter<boolean>  = new EventEmitter();
	setRightSideUserInfoBlock: EventEmitter<boolean> = new EventEmitter();
	setMultiUserInfoBlock: EventEmitter<boolean>     = new EventEmitter();
	setCartIconCount: EventEmitter<number>           = new EventEmitter();
	setMatSidenavContentSize: EventEmitter<boolean>  = new EventEmitter();
	showAtktChange: EventEmitter<boolean>            = new EventEmitter();	
	setHeaderImage: EventEmitter<boolean>            = new EventEmitter();
}
