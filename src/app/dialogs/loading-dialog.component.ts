import { Component, Input} from '@angular/core';
import { NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';


@Component({
  template: `
    <div class="modal-header" style="color:black">
      <h4 class="modal-title">SITA AMS Tow Tracker</h4>
    </div>
    <div class="modal-body" style="color:black" align="center">
    <p>Loading Data</p>
    <p>Please Wait</p>
    </div>

  `
})
export class LoadingDialogComponent {

  constructor(public activeModal: NgbActiveModal, private modalService: NgbModal) {}

}
