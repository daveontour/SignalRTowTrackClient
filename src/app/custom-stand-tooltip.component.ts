import { Component, ViewEncapsulation } from '@angular/core';
import { ITooltipAngularComp } from 'ag-grid-angular/public-api';


@Component({
  // tslint:disable-next-line:component-selector
  templateUrl: './custom-stand-tooltip.component.html',
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

export class CustomStandTooltip implements ITooltipAngularComp {
  public params: any;
  public data: any;
  public row: any;

  agInit(params): void {

    debugger;
    this.params = params;
    this.row = this.params.api.getDisplayedRowAtIndex(params.rowIndex);

    const col = params.colDef.tooltipField;
    if (col === 'From'){
      this.data = this.row.data.FromStand;
    } else {
      this.data = this.row.data.ToStand;
    }

    for ( let i  = this.data.CustomFields.length; i < 8; i++){
      this.data.CustomFields.push({Name: '', Value: ''});
    }
  }
}
