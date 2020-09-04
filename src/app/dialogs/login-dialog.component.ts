import { Component, Input} from '@angular/core';
import { NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';


@Component({
  template: `
    <div class="modal-header" style="color:black">
      <h4 class="modal-title">SITA AMS Tow Tracker</h4>
    </div>
    <div class="modal-body" style="color:black" align="center">
      <p>Login to access Tow Tracker using your AMS credentials</p>
      <table>
      <tr><td><label>User Name:&nbsp;</label></td><td><input type="text" id = "id" /></td></tr>
      <tr><td><label>&nbsp;&nbsp;Password:&nbsp;</label></td><td><input type="password" id = "token" /></td></tr>
      </table>
    </div>
    <div class="modal-footer">
    <button type="button" class="btn btn-outline-dark" (click)="button1Click()">Login</button>
    </div>
  `
})
export class LoginDialogComponent {

  public id: string;
  public token: string;

  constructor(public activeModal: NgbActiveModal, private modalService: NgbModal) {}

  button1Click(): any {
     this.id  = $('#id').val().toString();
     this.token  = $('#token').val().toString();
     this.activeModal.close({login: true, id: this.id, token: this.token});
  }
  button2Click(): any  {
     this.activeModal.close({login: false});
    }
}
