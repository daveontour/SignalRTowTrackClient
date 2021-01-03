import { GenericAlertComponent } from './dialogs/generic-alert.component';
import { GlobalService } from './services/global.service';
import { SignalRService } from './services/signalr.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AgGridModule } from 'ag-grid-angular';
import { HttpClientModule } from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import {LoginDialogComponent} from './dialogs/login-dialog.component';
import {LoginADDialogComponent} from './dialogs/loginAD-dialog.component';
import {ProceedLoadDialogComponent} from './dialogs/proceedload-dialog.component';

import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [AppComponent, LoginDialogComponent, ProceedLoadDialogComponent, GenericAlertComponent ],
  imports: [
   BrowserModule,
   CommonModule,
   BrowserAnimationsModule,
   AgGridModule.withComponents([ CommonModule]),
   HttpClientModule,
   FormsModule,
   MatMenuModule,
   MatIconModule,
   NgbModule
  ],
  providers: [ GlobalService, SignalRService ],
  bootstrap: [AppComponent],
  exports: [BrowserModule, MatMenuModule, MatIconModule],
  entryComponents: [ LoginDialogComponent, LoginADDialogComponent, ProceedLoadDialogComponent, GenericAlertComponent ],
})
export class AppModule { }
