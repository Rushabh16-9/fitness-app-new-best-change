import { Component, OnInit, ViewEncapsulation, EventEmitter, Inject } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

import { ImageCroppedEvent } from 'ngx-image-cropper';

import { SnackBarMsgComponent } from 'app-shared-components/snack-bar-msg/snack-bar-msg.component';
import { AllEventEmitters } from 'app/global/all-event-emitters';

import * as globalFunctions from 'app/global/globalFunctions';
import * as allMsgs from 'app/global/allMsgs';

@Component({
  selector: 'image-cropper-dialog',
  templateUrl: './image-cropper-dialog.component.html',
  styleUrls: ['./image-cropper-dialog.component.css'],
  providers: [SnackBarMsgComponent],
  encapsulation: ViewEncapsulation.None  
})
export class ImageCropperDialogComponent implements OnInit {

  mode: string;
  modalTitle: string;
  imageChangedEvent: any = '';
  croppedImage: any;
  onOk = new EventEmitter();
  coordinates = {x:0};

  constructor(
    public _snackBarMsgComponent: SnackBarMsgComponent,
    private allEventEmitters: AllEventEmitters, 
    @Inject(MAT_DIALOG_DATA) public imageEvent: any
  ) {

  }

  ngOnInit() {

    this._snackBarMsgComponent.closeSnackBar();
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event;
  }

  imageLoaded() {
  }

  loadImageFailed() {
  }

  onOkClick() {
    this.onOk.emit(this.croppedImage);
  }

}
