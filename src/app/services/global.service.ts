import { Injectable, NgModuleRef } from '@angular/core';
import * as moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericAlertComponent } from '../dialogs/generic-alert.component';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  public rangeMode = 'offset';
  public offsetFrom = -300;
  public offsetTo = 240;
  public id = null;
  public token = null;
  public userStatus = 'Logged Out';
  public timeZone = 'Local';
  public blinkBeforeStart: number;
  constructor(private modalService: NgbModal) { }

  public openModalAlert(title: string, message: string, message2: string = '', sizeS: string = 'lg', showFooter: boolean = true ): any {
    const modalRef = this.modalService.open(GenericAlertComponent, { centered: true, size: sizeS, backdrop: 'static'});
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.message2 = message2;
    modalRef.componentInstance.showFooter = showFooter;
    modalRef.componentInstance.button1 = 'Close';
    modalRef.componentInstance.showButton2 = false;

    return modalRef;
  }
}
