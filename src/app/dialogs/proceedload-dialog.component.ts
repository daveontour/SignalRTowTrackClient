import { Component, Input} from '@angular/core';
import { NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';


@Component({
  template: `
    <div class="modal-header" style="color:black">
      <h4 class="modal-title">SITA AMS Tow Tracker</h4>
    </div>
    <div class="modal-body" style="color:black" align="center">
    <p>Requested search range is outside the current repository range</p>
    <p>Unable to complete search</p>
    <p>Current Range: {{param1}} to {{param2}}<br/>Requested Range: {{param3}} to {{param4}}</p>
    </div>
    <div class="modal-footer">
    <button type="button" class="btn btn-outline-dark" (click)="button1Click()">Cancel</button>
    </div>
  `
})
export class ProceedLoadDialogComponent {

  @Input() param1: any;
  @Input() param2: any;
  @Input() param3: any;
  @Input() param4: any;


  constructor(public activeModal: NgbActiveModal, private modalService: NgbModal) {}

  button1Click(): any {
     this.activeModal.close({proceed: false});
  }
  // button2Click(): any  {
  //    this.activeModal.close({proceed: true});
  //   }
}
