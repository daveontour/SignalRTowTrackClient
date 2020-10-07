import { Injectable, NgModuleRef } from '@angular/core';
import * as moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericAlertComponent } from '../dialogs/generic-alert.component';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  public rangeMode = 'offset';
  public offsetFrom = -720;
  public offsetTo = 720;
  public id = null;
  public token = null;
  public userStatus = 'Logged Out';
  public timeZone = 'Local';
  public blinkBeforeStart: number;
  constructor(private modalService: NgbModal) { }

  // tslint:disable-next-line:max-line-length
  public openModalAlert(title: string, message: string, message2: string = '', sizeS: string = 'lg', showFooter: boolean = true, button1: string = 'Close' ): any {
    const modalRef = this.modalService.open(GenericAlertComponent, { centered: true, size: sizeS, backdrop: 'static'});
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.message2 = message2;
    modalRef.componentInstance.showFooter = showFooter;
    modalRef.componentInstance.button1 = button1;
    modalRef.componentInstance.showButton2 = false;

    return modalRef;
  }
}
