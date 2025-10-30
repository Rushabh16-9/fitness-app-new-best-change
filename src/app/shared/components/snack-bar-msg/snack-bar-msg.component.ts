import { Component, Input } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';

import * as globalFunctions from 'app/global/globalFunctions';

@Component({
  selector: 'snack-bar-msg',
  templateUrl: './snack-bar-msg.component.html',
  styleUrls: ['./snack-bar-msg.component.scss']
})
export class SnackBarMsgComponent {

  constructor(
    public snackBar: MatSnackBar
  ) {}

  openSnackBar(message: string, action: string, className: string, duration: number = 0, err:any = '') {

    if ( !globalFunctions.isEmpty(err) ) {
      if (err.message != undefined) {
        message = err.message;
      }
    }

    this.snackBar.open(message, action, {
      panelClass: [className],
      duration: duration,
      verticalPosition: 'top',
      horizontalPosition: 'center'      
    });
  }

  closeSnackBar() {
    this.snackBar.dismiss();
  }

}
