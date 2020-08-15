import { GlobalService } from './services/global.service';
import { SignalRService } from './services/signalr.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { AgGridModule } from 'ag-grid-angular';
import { HttpClientModule } from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import { MatDialogModule} from '@angular/material/dialog';
import {MatMenuModule} from '@angular/material/menu';

import {ConfirmationDialogComponent} from './dialogs/confirmation-dialog.component';
import {LoginDialogComponent} from './dialogs/login-dialog.component';
import { CommonModule } from '@angular/common';



@NgModule({
  declarations: [
    AppComponent, ConfirmationDialogComponent, LoginDialogComponent
  ],
  imports: [
   BrowserModule,
   CommonModule,
   BrowserAnimationsModule,
   AgGridModule.withComponents([ CommonModule]),
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
    MatDialogModule,
    MatMenuModule,

  ],
  entryComponents: [ConfirmationDialogComponent, LoginDialogComponent],
})
export class AppModule { }
