import { Injectable, EventEmitter } from '@angular/core';
import 'jquery';
import { HubConnection } from 'signalr';
import { NgZone } from '@angular/core';
import { GlobalService } from './global.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialog } from '../confirmation-dialog.component';

declare var jQuery: any;
declare var $: any;


@Injectable({
  providedIn: 'root'
})
export class SignalRService {

  connectionEstablished = new EventEmitter<boolean>();
  connectionEstablishing = new EventEmitter<boolean>();
  connectionError = new EventEmitter<boolean>();
  addReceived = new EventEmitter<any>();
  deleteReceived = new EventEmitter<any>();
  updateReceived = new EventEmitter<any>();
  towsReceived = new EventEmitter<any>();
  allowActualStartUpdate = new EventEmitter<boolean>();
  allowActualEndUpdate = new EventEmitter<boolean>();
  allowReadyUpdate = new EventEmitter<boolean>();
  enableReadyCB = new EventEmitter<boolean>();
  private connectionIsEstablished = false;
  private hubConnection: HubConnection;
  private proxy;
  chat: any;

  constructor(private zone: NgZone, public globals: GlobalService, public dialog: MatDialog) {
    this.createConnection();
    this.registerOnServerEvents();
    this.startConnection();
  }

  private createConnection(): any {
    const that = this;
    // The hub URL is set in index.html to make it easier edit for runtime requirements
    this.hubConnection = $.hubConnection(window.localStorage.getItem('hubURL'));
    this.proxy = this.hubConnection.createHubProxy('TowHub');

    this.hubConnection.reconnecting(function () {
      that.connectionEstablishing.emit(true);
    });
    this.hubConnection.reconnected(function () {
      that.connectionEstablished.emit(true);
    });
    this.hubConnection.disconnected(function () {
      that.connectionError.emit(true);
    });
  }
  private registerOnServerEvents(): void {

    this.proxy.on('NewMessage', (data: any) => {
      console.log(data);
    });
    this.proxy.on('Add', (data: any) => {
      this.addReceived.emit(data);
      this.zone.run(() => { });
    });
    this.proxy.on('Update', (data: any) => {
      this.updateReceived.emit(data);
      this.zone.run(() => { });
    });
    this.proxy.on('Delete', (data: any) => {
      this.deleteReceived.emit(data);
      this.zone.run(() => { });
    });
    this.proxy.on('AllTows', (data: any) => {
      this.towsReceived.emit(data);
      this.zone.run(() => { });
    });
  }
  private startConnection(): void {
    const that = this;
    that.connectionEstablishing.emit(true);

    this.hubConnection
      .start()
      .then(() => {
        this.connectionIsEstablished = true;
        console.log('Hub connection started');
        this.connectionEstablished.emit(true);
        this.zone.run(() => { });
      })
      .catch(err => {
        console.log('Error while establishing connection, retrying...');
        setTimeout(function (): any { that.startConnection(); }, 5000);
        this.zone.run(() => { });
      });
  }

  public getTows(from: any, to: any): any {
    const that = this;
    this.proxy.invoke('getTows', from, to).done(function (tows): any {
      that.towsReceived.emit(tows);
      that.zone.run(() => { });
    }).fail(function (error) {
      console.log('Invocation of getTows failed. Error: ' + error);
    });
  }

  public updateActualStart(start: any, id: any): any {
    const that = this;
    this.proxy.invoke('UpdateActualStart', start, id, this.globals.id, this.globals.token).done(function (tows): any {

    }).fail(function (error) {
      console.log('Invocation of updateActual Start failed. Error: ' + error);
    });
  }

  public updateActualEnd(end: any, id: any): any {
    const that = this;
    this.proxy.invoke('UpdateActualEnd', end, id, this.globals.id, this.globals.token).done(function (tows): any {

    }).fail(function (error) {
      console.log('Invocation of updateActualEnd failed. Error: ' + error);
    });
  }

  public updateReadyState(state: any, id: any): any {
    const that = this;
    this.proxy.invoke('UpdateReadyState', state, id, this.globals.id, this.globals.token).done(function (tows): any {

    }).fail(function (error) {
      console.log('Invocation of UpdateReadyState failed. Error: ' + error);
    });
  }

  public login(id: string, token: string): any {
    this.globals.id = id;
    this.globals.token = token;
    const that = this;
    this.proxy.invoke('Login', id, token).done(function (data): any {
      that.globals.userStatus = 'Logged In';
      that.allowActualEndUpdate.emit(data.AllowActualEnd);
      that.allowActualStartUpdate.emit(data.AllowActualStart);
      that.allowReadyUpdate.emit(data.AllowReady);

      if (!(data.AllowActualEnd || data.AllowActualStart || data.AllowReady)) {
        const dialogRef = that.dialog.open(ConfirmationDialog, {
          data: {
            message: 'Login incorrect or no configured edit capability',
            buttonText: {
              ok: 'OK',
              cancel: 'Cancel'
            }
          }
        });
        dialogRef.afterClosed().subscribe((confirmed: any) => {
          const a = document.createElement('a');
          a.click();
          a.remove();

        });
        that.globals.userStatus = 'No Edit Access';
      }
      that.zone.run(() => { });
    }).fail(function (error) {
      console.log('Invocation of Login failed. Error: ' + error);
      that.allowActualEndUpdate.emit(false);
      that.allowActualStartUpdate.emit(false);
      that.allowReadyUpdate.emit(false);
      that.zone.run(() => { });
    });
  }

  public checkEnableReady(): any {
    const that = this;
    this.proxy.invoke('EnableReady').done(function (enable: boolean): any {
      that.enableReadyCB.emit(enable);
    }).fail(function (error) {
      that.enableReadyCB.emit(false);
      console.log('Invocation of Enable Ready failed. Error: ' + error);
    });
  }

  public logout(): any {
    const that = this;
    this.proxy.invoke('Logout', this.globals.id, this.globals.token).done(function (data): any {
      that.allowActualEndUpdate.emit(false);
      that.allowActualStartUpdate.emit(false);
      that.allowReadyUpdate.emit(false);
    }).fail(function (error) {
      that.allowActualEndUpdate.emit(false);
      that.allowActualStartUpdate.emit(false);
      that.allowReadyUpdate.emit(false);
      console.log('Invocation of Login failed. Error: ' + error);
    });
    that.allowActualEndUpdate.emit(false);
    that.allowActualStartUpdate.emit(false);
    that.allowReadyUpdate.emit(false);
    this.globals.userStatus = 'Logged Out';
    this.globals.id = null;
    this.globals.token = null;
    that.zone.run(() => { });
  }
  public getTowsOneOff(from: any, to: any): any {
    const that = this;
    this.proxy.invoke('getTowsOneOff', from, to).done(function (tows): any {
      that.towsReceived.emit(tows);
      that.zone.run(() => { });
    }).fail(function (error) {
      console.log('Invocation of getTowsOneOff failed. Error: ' + error);
    });
  }
}
