import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { ITooltipAngularComp } from 'ag-grid-angular/public-api';
import * as moment from 'moment';


@Component({
  // tslint:disable-next-line:component-selector
  templateUrl: './custom-plan-tooltip.component.html',
  styles: [
    `
      :host {
        position: absolute;
        width: 570px;
        display:block
        border: 3px solid darkblue;
        overflow: auto;
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

  public data: any;
  public row: any;
  public arrUTC = '';
  public depUTC = '';

  agInit(params): void {

    this.row = params.api.getDisplayedRowAtIndex(params.rowIndex);
    this.data = this.row.data.TowPlanList;

    try {
      const x = this.row.data.Arrival.split(' ')[1];
      if (x !== null && typeof(x) !== 'undefined') {
        this.arrUTC = '(' + moment(x).utc().format('YYYY-MM-DDTHH:mm') + 'Z)';
      }
    } catch (Exception) {
      this.arrUTC = '';
    }
    try {
      const x = this.row.data.Departure.split(' ')[1];
      if (x !== null && typeof(x) !== 'undefined') {
        this.depUTC = '(' + moment(x).utc().format('YYYY-MM-DDTHH:mm') + 'Z)';
      }
    } catch (Exception) {
      this.depUTC = '';
    }
  }
}

// This is a hack to get *ngFor workin with new Ivy compiler
// See https://indepth.dev/lazy-loading-angular-modules-with-ivy/
@NgModule({
  declarations: [CustomPlanTooltip],
  imports: [CommonModule]
})
class LazyModule { }
