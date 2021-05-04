import { Injectable, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import 'jquery';
import { HubConnection } from 'signalr';
import { NgZone } from '@angular/core';
import { GlobalService } from './global.service';
import { ProceedLoadDialogComponent } from '../dialogs/proceedload-dialog.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


declare var jQuery: any;
declare var $: any;

@Injectable({
  providedIn: 'root'
})
export class SignalRService {

  // All the emitters for the received messages.
  connectionEstablished = new EventEmitter<boolean>();
  connectionReEstablished = new EventEmitter<boolean>();
  connectionEstablishing = new EventEmitter<boolean>();
  connectionError = new EventEmitter<boolean>();
  addReceived = new EventEmitter<any>();
  deleteReceived = new EventEmitter<any>();
  updateReceived = new EventEmitter<any>();
  towsReceived = new EventEmitter<any>();
  allowActual = new EventEmitter<boolean>();
  configCallBack = new EventEmitter<boolean[]>();
  loggedIn = new EventEmitter<boolean>();
  loggedOut = new EventEmitter<boolean>();
  turboModeComplete = new EventEmitter<boolean>();
  adserverFailure = new EventEmitter<boolean>();
  suicideModeComplete = new EventEmitter<boolean>();
  adLoginResult = new EventEmitter<string>();
  forceLogoout = new EventEmitter<any>();
  serverPing = new EventEmitter<any>();

  private hubConnection: HubConnection;
  private proxy;
  public disableAccess = true;
  public connectionID: string;
  public tryingToReconnect = false;
  public uuid: string;
  public ConnectionStarted = false;

  constructor(private zone: NgZone, public globals: GlobalService, private modalService: NgbModal) {
    this.createConnection();
    this.registerOnServerEvents();
    this.startConnection();
  }

  private createConnection(): any {
    const that = this;
    // The hub URL is set in index.html to make it easier edit for runtime requirements
    this.hubConnection = $.hubConnection(window.localStorage.getItem('hubURL'));
    this.proxy = this.hubConnection.createHubProxy('TowHub');

    this.hubConnection.reconnecting(() => {
      that.tryingToReconnect = true;
      console.log("reconnecting");
      that.connectionEstablishing.emit(true);
    });

    this.hubConnection.reconnected(() => {
      console.log("reconnected");
      this.ConnectionStarted = true;
      that.tryingToReconnect = false;
      that.connectionReEstablished.emit(true);
    });


    this.hubConnection.disconnected(() => {
      that.connectionError.emit(true);
      this.ConnectionStarted = false;
      if (this.hubConnection.lastError) {
        console.log("Disconnected. Reason: " + this.hubConnection.lastError.message);
      } else {
        console.log("Disconnected. No Reason.");
      }
    });
  }
  private registerOnServerEvents(): void {

    const that = this;

    this.proxy.on('ForceLogout', () => {
      this.forceLogoout.emit();
      this.zone.run(() => { });
    });
    this.proxy.on('Ping', () => {
      this.serverPing.emit();
      this.zone.run(() => { });
    });
    this.proxy.on('Add', (data: any) => {
      if (that.disableAccess) {
        return;
      }
      this.addReceived.emit(data);
      this.zone.run(() => { });
    });
    this.proxy.on('Update', (data: any) => {
      if (that.disableAccess) {
        return;
      }
      this.updateReceived.emit(data);
      this.zone.run(() => { });
    });

    this.proxy.on('TurboModeComplete', (data: any) => {
      this.turboModeComplete.emit(true);
      this.zone.run(() => { });
    });

    this.proxy.on('SuicideModeComplete', (data: any) => {
      this.suicideModeComplete.emit(true);
      this.zone.run(() => { });
    });

    this.proxy.on('Delete', (data: any) => {
      if (that.disableAccess) {
        return;
      }
      this.deleteReceived.emit(data);
      this.zone.run(() => { });
    });
    this.proxy.on('AllTows', (data: any) => {
      if (that.disableAccess) {
        return;
      }
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
        this.ConnectionStarted = true;
        this.connectionEstablished.emit(true);
        this.zone.run(() => { });
      })
      // tslint:disable-next-line:variable-name
      .catch((_err: any) => {
        this.ConnectionStarted = false;
        setTimeout(() => { that.startConnection(); }, 5000);
        this.zone.run(() => { });
      });
  }

  public reStartConnection(): void {
    const that = this;
    that.connectionEstablishing.emit(true);
    this.hubConnection.logging = true;
    this.hubConnection
      .start()
      .then(() => {
        this.ConnectionStarted = true;
        this.connectionReEstablished.emit(true);


        this.zone.run(() => { });
      })
      // tslint:disable-next-line:variable-name
      .catch((_err: any) => {
        this.ConnectionStarted = false;
        setTimeout(() => { that.startConnection(); }, 5000);
        this.zone.run(() => { });
      });
  }

  public getTows(from: any, to: any): any {
    const that = this;
    // Restart the hub if the connection has been lost
    if (this.ConnectionStarted == false) {
      console.log("Need to restart connection")
      this.hubConnection.start().then(() => {
        console.log("Connection Restarted");
        this.ConnectionStarted = true;
        this.connectionReEstablished.emit(true);
        this.getTows(from, to);
        this.zone.run(() => { });
      }).catch((_err: any) => {
        console.log("Connection Restart Failed");
        this.getTows(from, to);
        this.zone.run(() => { });
      });

      return;
    }

    this.proxy.invoke('getTows', from, to).done((tows) => {
      that.towsReceived.emit(tows);
      that.zone.run(() => { });
    }).fail((error: any) => {
      console.log('Invocation of getTows failed. Error: ' + error);
    });
  }

  public getTowsForDateRange(rangeDateFrom: any, rangeDateTo: any, type: any): any {

    // Restart the hub if the connection has been lost
    if (this.ConnectionStarted == false) {
      console.log("Need to restart connection")
      this.hubConnection.start().then(() => {
        console.log("Connection Restarted");
        this.ConnectionStarted = true;
        this.connectionReEstablished.emit(true);
        this.getTowsForDateRange(rangeDateFrom, rangeDateTo, type);
        this.zone.run(() => { });
      }).catch((_err: any) => {
        console.log("Connection Restart Failed");
        this.getTowsForDateRange(rangeDateFrom, rangeDateTo, type);
        this.zone.run(() => { });
      });

      return;
    }
    const that = this;

    this.proxy.invoke('checkInCacheForDateRange', rangeDateFrom, rangeDateTo, this.uuid).done((c) => {


      if (c.In) {

        const modaLoadRef = that.globals.openModalAlert('SITA AMS Tow Tracker', 'Loading Data', 'Please Wait', 'sm', false);
        this.proxy.invoke('getTowsForDateRange', rangeDateFrom, rangeDateTo, type, this.uuid).done((tows) => {
          modaLoadRef.close();
          that.towsReceived.emit(tows);
          that.zone.run(() => { });
        }).fail((error: any) => {
          modaLoadRef.close();
          that.globals.openModalAlert('SITA AMS Tow Tracker', 'Loading Data Failed', '', 'sm');
          that.zone.run(() => { });
          console.log('Invocation of getTowsForDateRange failed. Error: ' + error);
        });
      } else {

        // tslint:disable-next-line:max-line-length
        const modalRef = this.modalService.open(ProceedLoadDialogComponent, { centered: true, size: 'sm', backdrop: 'static' });
        modalRef.componentInstance.param1 = moment(c.FromTime).format('YYYY-MM-DD');
        modalRef.componentInstance.param2 = moment(c.ToTime).format('YYYY-MM-DD');
        modalRef.componentInstance.param3 = moment(rangeDateFrom).format('YYYY-MM-DD');
        modalRef.componentInstance.param4 = moment(rangeDateTo).format('YYYY-MM-DD');
        that.zone.run(() => { });
      }
    }).fail((error) => {
      console.log('Invocation of getTowsForDateRange failed. Error: ' + error);
    });

  }

  public updateActualStart(start: any, id: any): any {

    // Restart the hub if the connection has been lost
    if (this.ConnectionStarted == false) {
      console.log("Need to restart connection")
      this.hubConnection.start().then(() => {
        console.log("Connection Restarted");
        this.ConnectionStarted = true;
        this.connectionReEstablished.emit(true);
        this.updateActualStart(start, id);
        this.zone.run(() => { });
      }).catch((_err: any) => {
        console.log("Connection Restart Failed");
        this.updateActualStart(start, id);
        this.zone.run(() => { });
      });

      return;
    }

    if (this.disableAccess) {
      this.globals.openModalAlert('SITA AMS Tow Tracker', 'Read Only Access', 'Change will not be applied', 'sm');
      return;
    }
    const that = this;
    const modalRef = that.globals.openModalAlert('SITA AMS Tow Tracker', 'Updating Actual Start', 'Please Wait', 'sm', false);
    this.proxy.invoke('UpdateActualStart', start, id, this.uuid).done((msg: string) => {
      modalRef.close();
      if (msg !== 'OK') {
        that.globals.openModalAlert('SITA AMS Tow Tracker', 'Update Failed', msg, 'sm');
      }
    }).fail((error: any) => {
      modalRef.close();
      that.globals.openModalAlert('SITA AMS Tow Tracker', 'Error Updating Actual Start', error, 'lg');
      console.log('Invocation of updateActual Start failed. Error: ' + error);
    });

  }

  public updateActualEnd(end: any, id: any): any {
    if (this.disableAccess) {
      this.globals.openModalAlert('SITA AMS Tow Tracker', 'Read Only Access', 'Change will not be applied', 'sm');
      return;
    }

    // Restart the hub if the connection has been lost
    if (this.ConnectionStarted == false) {
      console.log("Need to restart connection")
      this.hubConnection.start().then(() => {
        console.log("Connection Restarted");
        this.ConnectionStarted = true;
        this.connectionReEstablished.emit(true);
        this.updateActualEnd(end, id);
        this.zone.run(() => { });
      }).catch((_err: any) => {
        console.log("Connection Restart Failed");
        this.updateActualEnd(end, id);
        this.zone.run(() => { });
      });

      return;
    }

    const that = this;
    const modalRef = that.globals.openModalAlert('SITA AMS Tow Tracker', 'Updating Actual End', 'Please Wait', 'sm', false);
    this.proxy.invoke('UpdateActualEnd', end, id, this.uuid).done((msg: string) => {
      modalRef.close();
      if (msg !== 'OK') {
        that.globals.openModalAlert('SITA AMS Tow Tracker', 'Update Failed', msg, 'sm');
      }
    }).fail((error: any) => {
      modalRef.close();
      that.globals.openModalAlert('SITA AMS Tow Tracker', 'Error Updating Actual End', error, 'lg');
      console.log('Invocation of updateActualEnd failed. Error: ' + error);
    });
  }

  public updateReadyState(state: any, id: any): any {
    if (this.disableAccess) {
      this.globals.openModalAlert('SITA AMS Tow Tracker', 'Read Only Access', 'Change will not be applied', 'sm');
      return;
    }

    // Restart the hub if the connection has been lost
    if (this.ConnectionStarted == false) {
      console.log("Need to restart connection")
      this.hubConnection.start().then(() => {
        console.log("Connection Restarted");
        this.ConnectionStarted = true;
        this.connectionReEstablished.emit(true);
        this.updateReadyState(state, id);
        this.zone.run(() => { });
      }).catch((_err: any) => {
        console.log("Connection Restart Failed");
        this.updateReadyState(state, id);
        this.zone.run(() => { });
      });

      return;
    }

    const that = this;
    const modalRef = that.globals.openModalAlert('SITA AMS Tow Tracker', 'Updating Ready State', 'Please Wait', 'sm', false);
    this.proxy.invoke('UpdateReadyState', state, id, this.uuid).done((tows) => {
      modalRef.close();
    }).fail((error: any) => {
      modalRef.close();
      that.globals.openModalAlert('SITA AMS Tow Tracker', 'Error Ready State', error, 'lg');
      console.log('Invocation of UpdateReadyState failed. Error: ' + error);
    });
  }


  /*
  Login user when Active Directory use is NOT used. Uses AMS local users authrntication
  */
  public login(id: string, token: string): any {
    // Restart the hub if the connection has been lost
    if (this.ConnectionStarted == false) {
      console.log("Need to restart connection")
      this.hubConnection.start().then(() => {
        console.log("Connection Restarted");
        this.ConnectionStarted = true;
        this.connectionReEstablished.emit(true);
        this.login(id, token);
        this.zone.run(() => { });
      }).catch((_err: any) => {
        console.log("Connection Restart Failed");
        this.login(id, token);
        this.zone.run(() => { });
      });

      return;
    }

    this.globals.id = id;
    this.globals.token = token;
    const that = this;
    const modaLoadRef = that.globals.openModalAlert('SITA AMS Tow Tracker', 'Loading Data', 'Please Wait', 'sm', false);
    that.zone.run(() => { });
    this.proxy.invoke('Login', id, token).done((data) => {


      modaLoadRef.close();

      that.globals.blinkBeforeStart = data.BlinkBeforeStart;
      if (!data.View && !data.Edit) {
        const modalRef = that.globals.openModalAlert('SITA AMS Tow Tracker', 'Login credentials incorrect or no configured access to Tow Tracker', '', 'sm', true, 'OK');
        modalRef.result.then((result) => {
          that.loggedIn.emit(false);
        });
        that.disableAccess = true;
        that.globals.userStatus = 'No Access';
        that.globals.username = "-";
        this.uuid = null;
      } else if (!data.Edit) {

        const modalRef = that.globals.openModalAlert('SITA AMS Tow Tracker', 'Login Successful. View Access Only', '', 'sm');
        modalRef.result.then((result) => {
          that.disableAccess = false;
          this.uuid = data.UUID;
          that.loggedIn.emit(true);
        });
        that.globals.userStatus = 'No Edit Access';
        this.globals.username = data.User;
      } else if (data.Edit) {
        that.disableAccess = false;
        this.uuid = data.UUID;
        that.loggedIn.emit(true);
        that.allowActual.emit(true);
        that.globals.userStatus = 'Logged In';
        that.globals.username = data.User;
      }
      that.zone.run(() => { });
    }).fail((error) => {
      modaLoadRef.close();
      const modalRef = that.globals.openModalAlert('SITA AMS Tow Tracker', 'Server Connection Failure', 'Unable to login', 'sm');
      console.log('Invocation of Login failed. Error: ' + error);
      this.uuid = null;
      that.allowActual.emit(false);
      that.globals.username = "-";
      that.zone.run(() => { });
    });
  }

  /*
Login user with Active Directory Authentication
*/
  public loginAD(id: string, token: string): any {

    // Restart the hub if the connection has been lost
    if (this.ConnectionStarted == false) {
      console.log("Need to restart connection")
      this.hubConnection.start().then(() => {
        console.log("Connection Restarted");
        this.ConnectionStarted = true;
        this.connectionReEstablished.emit(true);
        this.loginAD(id, token);
        this.zone.run(() => { });
      }).catch((_err: any) => {
        console.log("Connection Restart Failed");
        this.loginAD(id, token);
        this.zone.run(() => { });
      });

      return;
    }
    this.globals.id = id;
    this.globals.token = token;
    const that = this;
    const modaLoadRef = that.globals.openModalAlert('SITA AMS Tow Tracker', 'Loading Data', 'Please Wait', 'sm', false);
    that.zone.run(() => { });
    this.proxy.invoke('LoginADUser', id, token).done((data) => {

      modaLoadRef.close();

 
      if (data.ADStatus == "BYPASS") {
        const modalRef = that.globals.openModalAlert('SITA AMS Tow Tracker', 'Active Directory validation error. Try using AMS local user credentials', '', 'sm', true, 'OK');
        modalRef.result.then((result) => {
          that.adserverFailure.emit(true);
        });
        that.disableAccess = true;
        that.globals.userStatus = 'No Access';
        that.globals.username = "-";
        this.uuid = null;
        that.zone.run(() => { });
        return;
      }

      if (!data.View && !data.Edit) {
        const modalRef = that.globals.openModalAlert('SITA AMS Tow Tracker', 'Login credentials incorrect or no configured access to Tow Tracker', '', 'sm', true, 'OK');
        modalRef.result.then((result) => {
          that.loggedIn.emit(false);
        });
        that.disableAccess = true;
        that.globals.userStatus = 'No Access';
        that.globals.username = "-";
        this.uuid = null;
      } else if (!data.Edit) {

        const modalRef = that.globals.openModalAlert('SITA AMS Tow Tracker', 'Login Successful. View Access Only', '', 'sm');
        modalRef.result.then((result) => {
          that.disableAccess = false;
          this.globals.username = data.User;
          this.uuid = data.UUID;
          that.loggedIn.emit(true);
        });
        that.globals.userStatus = 'No Edit Access';
      } else if (data.Edit) {
        that.disableAccess = false;
        this.uuid = data.UUID;
        that.loggedIn.emit(true);
        that.allowActual.emit(true);
        that.globals.username = data.User;
        that.globals.userStatus = 'Logged In';
      }
      that.zone.run(() => { });
    }).fail((error) => {
      modaLoadRef.close();
      const modalRef = that.globals.openModalAlert('SITA AMS Tow Tracker', 'Server Connection Failure', 'Unable to validate Active Directory User', 'sm');
      console.log('Invocation of Login failed. Error: ' + error);
      this.uuid = null;
      that.globals.username = "-";
      that.adLoginResult.emit('ADSERVEREROR');
      that.zone.run(() => { });
    });
  }

  public getConfig(): any {
    const that = this;
    this.proxy.invoke('GetConfig').done((config: boolean[]) => {
      // param0 = ENABLEREADY
      // param1 = ENABLERANGESELECT
      // param2 = LOGIN FOR VIEW ONLY
      // param3 = IN TURBO STARTUP
      // param4 = USE AD
      // param5 = SUICIDE MODE

      that.configCallBack.emit(config);
    }).fail((error: any) => {


      that.configCallBack.emit([false, false, false, false, false, false]);
      console.log('Invocation of Enable Ready failed. Error: ' + error);
    });
  }


  public logout(): any {

    // Restart the hub if the connection has been lost
    if (this.ConnectionStarted == false) {
      console.log("Need to restart connection")
      this.hubConnection.start().then(() => {
        console.log("Connection Restarted");
        this.ConnectionStarted = true;
        this.connectionReEstablished.emit(true);
        this.logout();
        this.zone.run(() => { });
      }).catch((_err: any) => {
        console.log("Connection Restart Failed");
        this.logout();
        this.zone.run(() => { });
      });

      return;
    }

    const that = this;
    that.disableAccess = true;
    this.proxy.invoke('Logout', this.globals.id, this.globals.token, this.uuid);
    that.allowActual.emit(false);
    that.loggedOut.emit(true);
    this.globals.userStatus = 'Logged Out';
    this.globals.id = null;
    this.globals.token = null;
    that.zone.run(() => { });
  }
}
