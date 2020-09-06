import { Component, Input} from '@angular/core';
import { NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';


@Component({
  template: `
    <div class="modal-header"  style="color:black">
      <h4 class="modal-title">{{title}}</h4>
    </div>
    <div class="modal-body"  style="color:black" align="center">
      <p>{{message}}</p>
      <p>{{message2}}</p>
    </div>
    <div *ngIf="showFooter" class="modal-footer">
    <button type="button" class="btn btn-outline-dark" (click)="button1Click()">{{button1}}</button>
    <button type="button" [ngClass]="{'btn':true, 'btn-outline-dark':true, 'd-none': !showButton2}"
     (click)="button2Click()">{{button2}}</button>
    </div>
  `
})
export class GenericAlertComponent {
  @Input() message: string;
  @Input() message2: string;
  @Input() title: string;
  @Input() button1: string;
  @Input() button2: string;
  @Input() showButton2 = false;
  @Input() param1: any;
  @Input() param2: any;
  @Input() showFooter: boolean;
  @Input() button1Fn = function(p: any) {};
  @Input() button2Fn = function(p: any) {};

  constructor(public activeModal: NgbActiveModal, private modalService: NgbModal) {}

  button1Click(): any {
     this.activeModal.close();
     this.button1Fn(this.param1);
  }
  button2Click(): any {
     this.activeModal.close();
     this.button2Fn(this.param2);
    }
}