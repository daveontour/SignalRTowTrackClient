import { Component, Input} from '@angular/core';
import { NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';


@Component({
  template: `
    <div class="modal-header" style="color:black">
      <h4 class="modal-title">SITA AMS Tow Tracker</h4>
    </div>
    <div class="modal-body" style="color:black" align="center">
      <p>Login credentials incorrect or no configured access to Tow Tracker</p>
    </div>
    <div class="modal-footer">
    <button type="button" class="btn btn-outline-dark" (click)="button1Click()">OK</button>
    </div>
  `
})
export class BadLoginDialogComponent {

  constructor(public activeModal: NgbActiveModal, private modalService: NgbModal) {}

  button1Click(): any {
     this.activeModal.close();
  }

}
