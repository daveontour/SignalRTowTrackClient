import { Component, ViewEncapsulation } from '@angular/core';
import { ITooltipAngularComp } from 'ag-grid-angular/public-api';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'tooltip-component',
  templateUrl: './custom-tooltip.component.html',
  styles: [
    `
      :host {
        position: absolute;
        width: 280px;
        height: 60px;
        border: 1px solid cornflowerblue;
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

  agInit(params): void {
    this.params = params;

    this.data = params.api.getDisplayedRowAtIndex(params.rowIndex).data;
    this.data.color = this.params.color || 'white';
  }
}
