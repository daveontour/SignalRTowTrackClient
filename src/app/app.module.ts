import { GlobalService } from './services/global.service';
import { SignalRService } from './services/signalr.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { AgGridModule } from 'ag-grid-angular';
import { HttpClientModule } from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { CustomTooltip } from './custom-tooltip.component';


import { MatDialogModule} from '@angular/material/dialog';
import {ConfirmationDialog} from './confirmation-dialog.component';
import {LoginDialog} from './login-dialog.component';
@NgModule({
  declarations: [
    AppComponent, CustomTooltip, ConfirmationDialog, LoginDialog
  ],
  imports: [
   BrowserModule,
   BrowserAnimationsModule,
   AgGridModule.withComponents([]),
   HttpClientModule,
   FormsModule,
   MatDialogModule
  ],
  providers: [
    GlobalService,
    SignalRService
  ],

  bootstrap: [AppComponent],
  exports: [
    BrowserModule,
    MatDialogModule
  ],
  entryComponents: [ConfirmationDialog, LoginDialog],
})
export class AppModule { }
