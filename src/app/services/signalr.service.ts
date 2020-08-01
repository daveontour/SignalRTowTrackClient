import { Injectable, EventEmitter } from '@angular/core';
import 'jquery';
import { HubConnection } from 'signalr';
import { NgZone } from '@angular/core';

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
  private connectionIsEstablished = false;
  private hubConnection: HubConnection;
  private proxy;
  chat: any;

  constructor(private zone: NgZone) {
    this.createConnection();
    this.registerOnServerEvents();
    this.startConnection();
  }

  private createConnection(): any {
    const that = this;
    // The hub URL is set in index.html to make it easier edit for runtime requirements
    this.hubConnection = $.hubConnection(window.localStorage.getItem('hubURL'));
    this.proxy = this.hubConnection.createHubProxy('TowHub');

    this.hubConnection.reconnecting(function(){
      that.connectionEstablishing.emit(true);
    });
    this.hubConnection.reconnected(function(){
      that.connectionEstablished.emit(true);
    });
    this.hubConnection.disconnected(function(){
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
    this.proxy.invoke('getTows', from, to).done(function(tows): any {
      that.towsReceived.emit(tows);
      that.zone.run(() => { });
    }).fail(function (error) {
      console.log('Invocation of getTows failed. Error: ' + error);
  });
  }

  public getTowsOneOff(from: any, to: any): any {
    const that = this;
    this.proxy.invoke('getTowsOneOff', from, to).done(function(tows): any {
      that.towsReceived.emit(tows);
      that.zone.run(() => { });
    }).fail(function (error) {
      console.log('Invocation of getTowsOneOff failed. Error: ' + error);
  });
  }
}
