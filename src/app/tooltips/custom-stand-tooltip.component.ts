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
  public Name = '-';
  public Area = '-';

  agInit(params): void {

    this.params = params;
    this.row = this.params.api.getDisplayedRowAtIndex(params.rowIndex);

    const col = params.colDef.tooltipField;

    if (col === 'From'){
      try {
        this.Name = this.row.data.FromStand.Name;
      } catch (ex){
        this.Name = '-';
      }
      try {
        this.Area = this.row.data.FromStand.Area;
      } catch (ex){
        this.Area = '-';
      }
    }

    if (col === 'To'){
      try {
        this.Name = this.row.data.ToStand.Name;
      } catch (ex){
        this.Name = '-';
      }
      try {
        this.Area = this.row.data.ToStand.Area;
      } catch (ex){
        this.Area = '-';
      }
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
