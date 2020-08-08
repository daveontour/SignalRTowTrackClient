import { Component, ViewEncapsulation } from '@angular/core';
import { ITooltipAngularComp } from 'ag-grid-angular/public-api';


@Component({
  // tslint:disable-next-line:component-selector
  templateUrl: './custom-plan-tooltip.component.html',
  styles: [
    `
      :host {
        position: absolute;
        width: 280px;
        height: 300px;
        border: 3px solid darkblue;
        overflow: hidden;
        pointer-events: none;
        transition: opacity 1s;
        backgroud-color: black;
      }

       :host.ag-tooltip-hiding {
        opacity: 0;
      }

    `,
  ],
})
// tslint:disable-next-line:component-class-suffix
export class CustomPlanTooltip implements ITooltipAngularComp {
  public params: any;
  public data: any;

  agInit(params): void {

    debugger;
    this.params = params;
    const row = this.params.api.getDisplayedRowAtIndex(params.rowIndex);


    let html = '<div>';
    row.data.TowPlanList.forEach(element => {
      html = html + '<b>' + element.TowingID + '<b><br/>';
    });

    html = html + '</div>';
    this.data = row.data.TowPlanList;

    for ( let i  = row.data.TowPlanList.length; i < 10; i++){
      row.data.TowPlanList.push({TowingID: '', From: '', To: ''});
    }

    this.data = row.data.TowPlanList;

  }
}
