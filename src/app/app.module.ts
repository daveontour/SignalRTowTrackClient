import { GlobalService } from './services/global.service';
import { SignalRService } from './services/signalr.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AgGridModule } from 'ag-grid-angular';
import { HttpClientModule } from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import { FormsModule } from '@angular/forms';
import { CustomTooltip } from './custom-tooltip.component';
@NgModule({
  declarations: [
    AppComponent, CustomTooltip
  ],
  imports: [
   BrowserModule,
   BrowserAnimationsModule,
   AgGridModule.withComponents([]),
   HttpClientModule,
   NgxMaterialTimepickerModule,
   FormsModule
  ],
  providers: [
    GlobalService,
    SignalRService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
