
import { Component} from '@angular/core';
import { ITooltipAngularComp } from 'ag-grid-angular/public-api';
import { data } from 'jquery';
import * as moment from 'moment';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'tooltip-component',
  templateUrl: './custom-time-tooltip.component.html',
  styles: [
    `
      :host {
        position: absolute;
        width: 420px;
        height: 100px;
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
export class CustomTooltip implements ITooltipAngularComp {
  public params: any;
  public data: any;
  public ScheduledStartUTC: any;
  public ScheduledEndUTC: any;
  public ActualStartUTC: any;
  public ActualEndUTC: any;

  agInit(params): void {
    this.params = params;

    this.data = params.api.getDisplayedRowAtIndex(params.rowIndex).data;
    this.data.color = this.params.color || 'white';

    if (this.data.ScheduledStart !== '-'){
      this.ScheduledStartUTC = moment(this.data.ScheduledStart).utc().format('YYYY-MM-DDTHH:mm') + 'Z';
    }
    if (this.data.ScheduledEnd !== '-'){
      this.ScheduledEndUTC = moment(this.data.ScheduledEnd).utc().format('YYYY-MM-DDTHH:mm') + 'Z';
    }

    if (this.data.ActualStart !== '-'){
      this.ActualStartUTC = moment(this.data.ActualStart).utc().format('YYYY-MM-DDTHH:mm') + 'Z';
    }
    if (this.data.ActualEnd !== '-'){
      this.ActualEndUTC = moment(this.data.ActualEnd).utc().format('YYYY-MM-DDTHH:mm') + 'Z';
    }
  }
}

