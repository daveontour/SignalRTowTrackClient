import { Component, NgModule } from '@angular/core';
import { ITooltipAngularComp } from 'ag-grid-angular/public-api';
import { CommonModule } from '@angular/common';


@Component({
  // tslint:disable-next-line:component-selector
  templateUrl: './custom-stand-tooltip.component.html',
  styles: [
    `
      :host {
        position: absolute;
        width: 280px;
        display: block;
        overflow: auto;
        border: 3px solid darkblue;
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

    this.params = params;
    this.row = this.params.api.getDisplayedRowAtIndex(params.rowIndex);

    const col = params.colDef.tooltipField;
    if (col === 'From'){
      this.data = this.row.data.FromStand;
    } else {
      this.data = this.row.data.ToStand;
    }

    if (this.data.Name === null){
      this.data.Name = '-';
    }
    if (this.data.Area === null){
      this.data.Name = '-';
    }
  }
}

// This is a hack to get *ngFor workin with new Ivy compiler
// See https://indepth.dev/lazy-loading-angular-modules-with-ivy/
@NgModule({
  declarations: [CustomStandTooltip],
  imports: [CommonModule]
})
class LazyModule2 { }
