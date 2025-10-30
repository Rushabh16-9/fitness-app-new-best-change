import { Injectable } from '@angular/core';
import { Settings } from './app.settings.model';

@Injectable()
export class AppSettings {
    public settings = new Settings(
        'OnFees',     // theme name
        true,         // loadingSpinner
        false,        // fixedHeader
        true,         // sidenavIsOpened
        true,         // sidenavIsPinned  
        true,         // sidenavUserBlock 
        'vertical',   // horizontal, vertical
        'default',    // default, compact, mini
        'brand-color', // brand-color, indigo-light, teal-light, red-light, blue-light, blue-dark, green-light, green-dark, pink-dark
        false         // true = rtl, false = ltr
    )
}
