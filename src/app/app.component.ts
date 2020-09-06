import { SignalRService } from './services/signalr.service';
import { GlobalService } from './services/global.service';
import { Component, OnInit, TemplateRef, Input } from '@angular/core';

import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { CustomTooltip } from './tooltips/custom-time-tooltip.component';
import { CustomPlanTooltip } from './tooltips/custom-plan-tooltip.component';
import { CustomStandTooltip } from './tooltips/custom-stand-tooltip.component';
import { ChangeDetectorRef } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { LoginDialogComponent } from './dialogs/login-dialog.component';
import { data } from 'jquery';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgZone } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @Input() content: TemplateRef<string>;
  public closeResult = '';

  public displayMode = 'Monitor';
  public rowData: any;
  public getRowNodeId: any;
  public offsetFrom = -300;
  public offsetTo = 240;

  public timeFormat = 'Local';

  public rangeFrom: number;
  public rangeTo: number;
  public rangeDate: any;

  public disableLogin = true;
  public disableLogout = true;

  public rangeDateFrom: any;
  public rangeDateTo: any;

  public showDateRange = false;
  public showCompleted = false;
  public showAll = true;
  public tooltipShowDelay = 0;
  public frameworkComponents: any;

  public selectMode = 'Monitor';
  public loadingStatus = '';

  public lastUpdate: string;
  public gridApi: any;
  public gridColumnApi: any;
  public numRows: any;
  public status = 'Connecting';
  public components: any;
  public enableReady = false;
  public overlayLoadingTemplate = '<span class="ag-overlay-loading-center">Please log in to load the tows</span>';
  public columnDefs = [
    { headerName: 'A/C Rego', field: 'AircraftRegistration', tooltipComponent: 'customPlanTooltip', tooltipField: 'TowingID' },
    { headerName: 'A/C Type', field: 'AircraftType', tooltipComponent: 'customPlanTooltip', tooltipField: 'TowingID' },
    { headerName: 'Tow ID', field: 'TowingID', tooltipComponent: 'customPlanTooltip', tooltipField: 'TowingID' },
    {
      headerName: 'Status', field: 'Status', sortable: true, flex: 3, comparator: this.statusComparator, valueGetter: this.statusGetter,
      cellClassRules: {
        SCHEDULED: (params: any) => { return params.data.Status === 'SCHEDULED'; },
        NOTSTARTED: (params: any) => { return params.data.Status === 'NOT_STARTED'; },
        STARTED: (params: any) => { return params.data.Status === 'STARTED'; },
        STARTEDEARLY: (params: any) => { return params.data.Status === 'STARTED_EARLY'; },
        STARTEDLATE: (params: any) => { return params.data.Status === 'STARTED_LATE'; },
        STARTEDRUNNINGOVERTIME: (params: any) => { return params.data.Status === 'STARTED_RUNNING_OVERTIME'; },
        COMPLETED: (params: any) => { return params.data.Status === 'COMPLETED'; },
        COMPLETEDEARLY: (params: any) => { return params.data.Status === 'COMPLETED_EARLY'; },
        COMPLETEDLATE: (params: any) => { return params.data.Status === 'COMPLETED_LATE'; },
        COMPLETEDDQMISSUES: (params: any) => { return params.data.Status === 'COMPLETED_DQM_ISSUES'; },

        BLINK: (params: any) => {
          if (params.data.BlinkBeforeStart < 0) {
            return false;
          }
          // tslint:disable-next-line:max-line-length
          return (params.data.Status === 'SCHEDULED' && moment(params.data.ScheduledStart).diff(moment(), 'm') < params.data.BlinkBeforeStart);
        },
      }
    },
    { headerName: 'Ready', field: 'Ready', colId: 'ReadyEdit', flex: 1, editable: true, cellEditor: 'readyCellEditor', hide: true },
    { headerName: 'Ready', field: 'Ready', colId: 'Ready', flex: 1 },
    { headerName: 'From', field: 'From', tooltipComponent: 'customStandTooltip', tooltipField: 'From', flex: 1 },
    { headerName: 'To', field: 'To', tooltipComponent: 'customStandTooltip', tooltipField: 'To', flex: 1 },
    // tslint:disable-next-line:max-line-length
    { headerName: 'Start', field: 'ScheduledStart', width: 120, tooltipComponent: 'customTooltip', tooltipField: 'ScheduledStart', sortable: true, valueFormatter: this.timeFormatter, comparator: this.timeComparator },
    // tslint:disable-next-line:max-line-length
    { headerName: 'End', field: 'ScheduledEnd', tooltipComponent: 'customTooltip', tooltipField: 'ScheduledStart', sortable: true, valueFormatter: this.timeFormatter, comparator: this.timeComparator },
    // tslint:disable-next-line:max-line-length
    { headerName: 'Act. Start', field: 'ActualStart', colId: 'ActualStartEdit', tooltipComponent: 'customTooltip', tooltipField: 'ScheduledStart', editable: true, cellEditor: 'yearCellEditor', valueFormatter: this.timeFormatter, hide: true },
    { headerName: 'Act. Start', field: 'ActualStart', colId: 'ActualStart', tooltipComponent: 'customTooltip', tooltipField: 'ScheduledStart', valueFormatter: this.timeFormatter },
    // tslint:disable-next-line:max-line-length
    { headerName: 'Act. End', field: 'ActualEnd', colId: 'ActualEndEdit', tooltipComponent: 'customTooltip', tooltipField: 'ScheduledStart', valueFormatter: this.timeFormatter, editable: true, cellEditor: 'yearCellEditor', hide: true },
    // tslint:disable-next-line:max-line-length
    { headerName: 'Act. End', field: 'ActualEnd', colId: 'ActualEnd', tooltipComponent: 'customTooltip', tooltipField: 'ScheduledStart', valueFormatter: this.timeFormatter },
    { headerName: 'Flights', field: 'Flights', tooltipField: 'TowingID', flex: 3, tooltipComponent: 'customPlanTooltip', }
  ];
  public defaultColDef = {
    editable: false,
    sortable: true,
    flex: 2,
    minWidth: 100,
    filter: true,
    resizable: true,
    tooltipComponent: 'customTooltip',
    enableCellChangeFlash: true,
    cellFlashDelay: 3000
  };

  constructor(
    private zone: NgZone,
    private http: HttpClient,
    public globals: GlobalService,
    public hubService: SignalRService,
    private ref: ChangeDetectorRef,
    private dialog: MatDialog,
    private modalService: NgbModal

  ) {

    const that = this;

    // Set it so the update is on the minute
    const sec = ((60 - moment().second()) + 5) * 1000;


    setTimeout(() => {
      that.minuteTick();
      setInterval(() => {
        that.minuteTick();
      }, 60000);
    }, sec);

    this.getRowNodeId = (d: any) => {
      return d.TowingID;
    };
    // tslint:disable-next-line:max-line-length
    this.frameworkComponents = { customTooltip: CustomTooltip, customPlanTooltip: CustomPlanTooltip, customStandTooltip: CustomStandTooltip };
    this.hubService.connectionEstablished.subscribe((connected: boolean) => {
      this.status = 'Connected';
      this.hubService.checkEnableReady();
    });

    this.components = { yearCellEditor: getYearCellEditor(), readyCellEditor: getTowReadyEditor() };
  }

  minuteTick(): any {
    const params = {
      force: false,
      suppressFlash: false,
    };
    this.gridApi.refreshCells(params);
  }
  ngOnInit(): void {
    this.subscribeToEvents();
  }

  // Comparator for the status field so they can be ordered appropraitely
  statusComparator(status1: string, status2: string): any {

    const priMap = new Map([
      ['Scheduled', 50],
      ['Not Started', 1],
      ['Started (Late)', 20],
      ['Started (Early)', 21],
      ['Started', 22],
      ['Completed', 80],
      ['Completed (DQM Issue)', 25],
      ['Completed (Early)', 57],
      ['Completed (Late)', 56],
      ['Started (Overtime)', 2],
    ]);

    let p1 = 0;
    let p2 = 0;
    if (priMap.has(status1)) {
      p1 = priMap.get(status1);
    } else {
      p1 = 0;
    }
    if (priMap.has(status2)) {
      p2 = priMap.get(status2);
    } else {
      p2 = 0;
    }
    if (p1 === p2) {
      return 0;
    } else if (p1 > p2) {
      return 1;
    } else {
      return -1;
    }
  }
  timeComparator(time1: string, time2: string): any {
    const t1 = moment(time1);
    const t2 = moment(time2);

    const res = t1.isBefore(t2);
    if (res) {
      return 1;
    } else {
      return -1;
    }

  }
  statusGetter(params): any {
    const descMap = new Map([
      ['SCHEDULED', 'Scheduled'],
      ['NOT_STARTED', 'Not Started'],
      ['STARTED', 'Started'],
      ['STARTED_EARLY', 'Started (Early)'],
      ['STARTED_LATE', 'Started (Late)'],
      ['COMPLETED', 'Completed'],
      ['COMPLETED_EARLY', 'Completed (Early)'],
      ['COMPLETED_LATE', 'Completed (Late)'],
      ['COMPLETED_DQM_ISSUES', 'Completed (DQM Issue)'],
      ['STARTED_RUNNING_OVERTIME', 'Started (Overtime)'],
    ]);
    if (descMap.has(params.data.Status)) {
      return descMap.get(params.data.Status);
    } else {
      return params.data.Status;
    }
  }
  timeFormatter(params): any {
    if (params.value === '-') {
      return '-';
    }
    if (params.value === null) {
      return '-';
    }
    const m = moment(params.value);


    if (params.data.PageDateFormat === 'UTC') {
      return m.utc().format('HH:mm') + 'Z';
    } else {
      return m.format('HH:mm');
    }
  }

  timeFormatChange(value: string): void {
    this.globals.timeZone = value;
    this.refresh();
  }
  sortDefault(): any {
    const sort = [
      {
        colId: 'Status',
        sort: 'asc',
      },
      {
        colId: 'ScheduledStart',
        sort: 'desc',
      }
    ];
    this.gridApi.setSortModel(sort);
  }
  logout(): any {
    this.rowData = [];
    this.numRows = 0;
    this.globals.rangeMode = 'offset';
    this.displayMode = 'Monitor';
    this.selectMode = 'Monitor';
    this.loadingStatus = '';
    this.hubService.logout();
  }


  // What to do with all the ecents coming from the host
  subscribeToEvents(): void {
    const that = this;
    this.hubService.deleteReceived.subscribe((message: string) => {
      that.deleteGridRow(message);
    });
    this.hubService.addReceived.subscribe((message: string) => {
      that.addGridRow(message);
    });
    this.hubService.updateReceived.subscribe((message: string) => {
      that.updateGridRow(message);
    });
    this.hubService.towsReceived.subscribe((message: string) => {
      that.loadingStatus = '';
      that.loadGrid(message);
    });
    this.hubService.connectionError.subscribe((message: string) => {
      that.status = 'Disconnected';
      that.globals.userStatus = 'Logged Out';
      that.rowData = [];
      that.numRows = 0;
      this.lastUpdate = moment().format('HH:mm:ss');
      const modalRef = that.globals.openModalAlert('SITA AMS Tow Tracker', 'Connection to host lost', 'Please try reload this page', 'sm');
      that.zone.run(() => { });
    });
    this.hubService.connectionEstablishing.subscribe((message: string) => {
      that.status = 'Connecting';
    });

    this.hubService.allowActual.subscribe((allow: boolean) => {

      that.gridColumnApi.setColumnsVisible(['ActualEnd'], !allow);
      that.gridColumnApi.setColumnsVisible(['ActualEndEdit'], allow);
      that.gridColumnApi.setColumnsVisible(['ActualStart'], !allow);
      that.gridColumnApi.setColumnsVisible(['ActualStartEdit'], allow);

      if (that.enableReady) {
        that.gridColumnApi.setColumnsVisible(['Ready'], !allow);
        that.gridColumnApi.setColumnsVisible(['ReadyEdit'], allow);
      }

    });

    this.hubService.loggedIn.subscribe((allow: boolean) => {
      if (allow) {
        that.hubService.getTows(that.offsetFrom, that.offsetTo);
        that.disableLogout = false;
        that.disableLogin = true;
      } else {
        that.disableLogout = true;
        that.disableLogin = false;
        that.openDialog();
        this.zone.run(() => { });
      }
    });

    this.hubService.loggedOut.subscribe((allow: boolean) => {
      that.openDialog();
      that.rowData = [];
      that.disableLogout = true;
      that.disableLogin = false;
      that.loadingStatus = '';
    });
    this.hubService.forceLogoout.subscribe(() => {
      that.logout();
    });


    this.hubService.configCallBack.subscribe((enable: boolean[]) => {

      that.enableReady = enable[0];
      that.gridColumnApi.setColumnsVisible(['Ready'], enable[0]);
      that.gridColumnApi.setColumnsVisible(['ReadyEdit'], false);

      // Show the range selector
      if (enable[1]) {
        that.showDateRange = true;
      }

      $('#loginBtn').show(0);
      $('#logoutBtn').show(0);
      that.openDialog();

    });
  }
  onGridReady(params): void {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.sortDefault();
  }
  onCellValueChanged(evt: any): void {

    if (evt.column.colId === 'ActualEndEdit') {
      this.hubService.updateActualEnd(evt.newValue, evt.data.TowingID);
    }
    if (evt.column.colId === 'ActualStartEdit') {
      this.hubService.updateActualStart(evt.newValue, evt.data.TowingID);
    }
    if (evt.column.colId === 'ReadyEdit') {
      this.hubService.updateReadyState(evt.newValue, evt.data.TowingID);
    }
  }
  loadGrid(data: any): void {
    const that = this;
    const rowsToAdd = [];

    data.forEach(element => {
      try {
        element = that.transformRow(element);

        if (that.globals.rangeMode === 'range' || that.checkAddRow(element)) {
          rowsToAdd.push(element);
        }
      } catch (ex) {
        console.log(ex);
      }
    });

    this.lastUpdate = moment().format('HH:mm:ss');

    if (this.globals.timeZone === 'UTC') {
      this.lastUpdate = moment().utc().format('HH:mm:ss') + 'Z';
    } else {
      this.lastUpdate = moment().format('HH:mm:ss');
    }

    this.rowData = rowsToAdd;
    this.numRows = rowsToAdd.length;
    this.ref.markForCheck();
  }


  updateGridRow(updatedTow: any): void {

    // // Only process updates in Monitor Mode
    // if (this.selectMode !== 'Monitor') {
    //   return;
    // }

    if (this.checkAddRow(updatedTow)) {
      updatedTow = this.transformRow(updatedTow);
      const itemsToUpdate = [];
      const itemsToAdd = [];

      // Check if it is already there, if so, update it, if not add it.
      // This is required because as tows fall into the window of interest, they are "updated"
      for (let i = 0; i < this.numRows; i++) {
        const rowData = this.gridApi.getDisplayedRowAtIndex(i).data;
        if (rowData.TowingID === updatedTow.TowingID) {
          itemsToUpdate.push(updatedTow);
          break;
        }
      }
      if (itemsToUpdate.length === 0) {
        itemsToAdd.push(updatedTow);
      }

      this.gridApi.updateRowData({ update: itemsToUpdate, add: itemsToAdd });
      this.numRows = this.gridApi.getDisplayedRowCount();
    } else {

      for (let i = 0; i < this.numRows; i++) {
        const rowData = this.gridApi.getDisplayedRowAtIndex(i).data;
        if (rowData.TowingID === updatedTow.TowingID) {
          const itemsToRemove = [updatedTow];
          this.gridApi.updateRowData({ remove: itemsToRemove });
          break;
        }
      }
      this.numRows = this.gridApi.getDisplayedRowCount();
    }

    if (this.globals.timeZone === 'UTC') {
      this.lastUpdate = moment().utc().format('HH:mm:ss') + 'Z';
    } else {
      this.lastUpdate = moment().format('HH:mm:ss');
    }
    const params = {
      force: false,
    };
    this.gridApi.refreshCells(params);
  }
  addGridRow(addTow: any): void {
    // // Only process updates in Monitor Mode
    if (this.selectMode !== 'Monitor') {
      return;
    }
    addTow = this.transformRow(addTow);
    if (this.checkAddRow(addTow)) {
      const itemsToAdd = [addTow];
      this.gridApi.updateRowData({ add: itemsToAdd });
      this.lastUpdate = moment().format('HH:mm:ss');
      this.numRows = this.gridApi.getDisplayedRowCount();
    }
    const params = {
      force: false,
    };
    this.gridApi.refreshCells(params);
  }
  deleteGridRow(removeTow: any): void {
    // Only process updates in Monitor Mode
    if (this.selectMode !== 'Monitor') {
      return;
    }
    const itemsToRemove = [removeTow];
    this.gridApi.updateRowData({ remove: itemsToRemove });
    this.numRows = this.gridApi.getDisplayedRowCount();
    if (this.globals.timeZone === 'UTC') {
      this.lastUpdate = moment().utc().format('HH:mm:ss') + 'Z';
    } else {
      this.lastUpdate = moment().format('HH:mm:ss');
    }
    const params = {
      force: false,
    };
    this.gridApi.refreshCells(params);
  }

  transformRow(row: any): any {

    if (row.ArrivalFlightDescriptor !== null) {
      row.Arrival = row.ArrivalFlightDescriptor.replace('@', ' ');
      row.Arrival = row.Arrival.substring(0, row.Arrival.length - 1);

    } else {
      row.Arrival = '-';
      row.ArrivalAirlineCode = '';
      row.ArrivalFltNum = '';
    }

    if (row.DepartureFlightDescriptor !== null) {
      row.Departure = row.DepartureFlightDescriptor.replace('@', ' ');
      row.Departure = row.Departure.substring(0, row.Departure.length - 1);
    } else {
      row.Departure = '-';
      row.DepartureAirlineCode = '';
      row.DepartureFltNum = '';
    }

    row.Flights = row.ArrivalAirlineCode + row.ArrivalFltNum + '/' + row.DepartureAirlineCode + row.DepartureFltNum;


    if (row.AircraftRegistration === null) {
      row.AircraftRegistration = '-';
    }
    if (row.AircraftType === null) {
      row.AircraftType = '-';
    }
    if (row.ActualStart === '0001-01-01T00:00:00') {
      row.ActualStart = '-';
    }
    if (row.ActualEnd === '0001-01-01T00:00:00') {
      row.ActualEnd = '-';
    }

    if (!row.TowPlan || row.TowPlan === null) {
      row.TowPlan = row.From + '->' + row.To;
    }

    row.PageDateFormat = this.globals.timeZone;
    row.BlinkBeforeStart = this.globals.blinkBeforeStart;

    return row;
  }
  checkAddRow(updatedTow: any): boolean {

    const towTime = moment(updatedTow.ScheduledStart);
    const diff = towTime.diff(moment(), 'minutes');
    if (diff < this.globals.offsetFrom || diff > this.globals.offsetTo) {
      return false;
    }
    if (this.selectMode !== 'Monitor') {
      return true;
    }

    if (!this.showCompleted && updatedTow.Status === 'COMPLETED') {
      return false;
    }
    if (!this.showCompleted && updatedTow.Status === 'COMPLETED_EARLY') {
      return false;
    }
    if (!this.showCompleted && updatedTow.Status === 'COMPLETED_LATE') {
      return false;
    }
    return true;
  }


  modeSelectChange(): any {
    this.rowData = [];
    this.numRows = 0;
    if (this.selectMode === 'Monitor') {
      this.globals.rangeMode = 'offset';
      this.displayMode = 'Monitor';
      this.setCurrentRange();
    } else {
      this.globals.rangeMode = 'range';
      this.displayMode = 'Review';
    }
  }

  refresh(): any {

    if (this.globals.rangeMode === 'offset') {
      this.setCurrentRange();
    } else {
      this.setSelectedDateRange();
    }

  }
  setCurrentRange(): any {
    this.loadingStatus = 'Loading Data';
    this.globals.rangeMode = 'offset';
    this.displayMode = 'Monitor';

    this.globals.offsetFrom = this.offsetFrom;
    this.globals.offsetTo = this.offsetTo;
    this.hubService.getTows(this.offsetFrom, this.offsetTo);
  }

  rangeDateFromSet(evt): any {
    const ms = moment(this.rangeDateFrom, 'YYYY-MM-DD');
    this.rangeDateTo = ms.add(31, 'days').format('YYYY-MM-DD');
  }
  rangeDateToSet(evt): any {
    // const ms = moment(this.rangeDateTo, 'YYYY-MM-DD');
    // this.rangeDateFrom = ms.add(-3, 'days').format('YYYY-MM-DD');
  }
  setSelectedDateRange(): any {

    this.rowData = [];
    this.zone.run(() => { });

    this.globals.rangeMode = 'range';
    this.displayMode = 'Review';

    const ms = moment(this.rangeDateFrom, 'YYYY-MM-DD');
    const me = moment(this.rangeDateTo, 'YYYY-MM-DD');

    if (!ms.isValid() || !ms.isValid()) {
      const modalRef = this.globals.openModalAlert('SITA AMS Tow Tracker', 'Warning: Invalid date range', 'Please select From and To dates', 'sm');
      return;
    }

    const rge = me.diff(ms, 'days');
    if (rge > 31) {
      const modalRef = this.globals.openModalAlert('SITA AMS Tow Tracker', 'Warning: Invalid date range', 'Maximum search range is 31 days', 'sm');
      return;
    }

    if (ms.isAfter(me)) {
      // tslint:disable-next-line:max-line-length
      const modalRef = this.globals.openModalAlert('SITA AMS Tow Tracker', 'Warning: Invalid date range', 'From date is after To date', 'sm');
      return;
    }


    this.globals.offsetFrom = ms.diff(moment(), 'm');
    this.globals.offsetTo = me.diff(moment(), 'm');

    this.hubService.getTowsForDateRange(this.rangeDateFrom, this.rangeDateTo, $('#towTypes').val());
  }

  saveToCSV(): void {

    const ts = moment().format('DDMMYYYYHHmm');
    const cb = this.getCSVData();
    const file = new File([cb], 'Tows_' + ts + '.csv');
    const link = document.createElement('a');
    link.download = file.name;
    link.href = URL.createObjectURL(file);
    link.click();
  }

  copyToClipboard(): void {

    const dummy = document.createElement('textarea');
    document.body.appendChild(dummy);
    dummy.value = this.getCSVData();
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);

    const modalRef = this.globals.openModalAlert('SITA AMS Tow Tracker', 'Grid data copied to clipboard', '', 'sm');

  }

  getCSVData(): string {
    let cb = 'TowingId,Status,ReadyState,FromStand,ToStand,ScheduledStart,ScheduledEnd,ActualStart,ActualEnd,AircraftRegistration,AircraftType,ArrivalFlight,SIBT,DepartureFlight,SOBT\n';

    for (let i = 0; i < this.numRows; i++) {
      const rowData = this.gridApi.getDisplayedRowAtIndex(i).data;

      let arrFlt = '';
      let arrTime = '';
      let depFlt = '';
      let depTime = '';

      if (rowData.Arrival !== null && rowData.Arrival !== '' && typeof (rowData.Arrival) !== 'undefined' && rowData.Arrival !== '-') {
        arrTime = rowData.Arrival.split(' ')[1];
        arrFlt = rowData.Arrival.split(' ')[0];
      }
      if (rowData.Departure !== null && rowData.Departure !== '' && typeof (rowData.Departure) !== 'undefined' && rowData.Departure !== '-') {
        depTime = rowData.Departure.split(' ')[1];
        depFlt = rowData.Departure.split(' ')[0];
      }

      cb += rowData.TowingID + ',';
      cb += rowData.Status + ',';
      cb += rowData.Ready + ',';
      cb += rowData.From + ',';
      cb += rowData.To + ',';
      cb += rowData.ScheduledStart + ',';
      cb += rowData.ScheduledEnd + ',';
      cb += rowData.ActualStart + ',';
      cb += rowData.ActualEnd + ',';
      cb += rowData.AircraftRegistration + ',';
      cb += rowData.AircraftType + ',';
      cb += arrFlt + ',';
      cb += arrTime + ',';
      cb += depFlt + ',';
      cb += depTime + '\n';

    }

    return cb;
  }

  // The login dialog
  openDialog(): any {

    const that = this;
    // tslint:disable-next-line:max-line-length
    const modalRef = this.modalService.open(LoginDialogComponent, { centered: true, size: 'sm', backdrop: 'static' });
    modalRef.result.then((result) => {
      if (result.login) {
        that.hubService.login(result.id, result.token);
      } else {
        that.openDialog();
        that.zone.run(() => { });
      }
    }, (reason) => {
      that.openDialog();
      that.zone.run(() => { });
    });
  }

  about(): void {
    const modalRef = this.globals.openModalAlert('SITA AMS Tow Tracker', 'AMS Tow Tracker - SITA MEIA Integration Team', 'Version 0.96', 'sm');
  }
}

function getYearCellEditor(): any {
  function YearCellEditor(): any { }
  YearCellEditor.prototype.getGui = function (): any {
    return this.eGui;
  };
  YearCellEditor.prototype.getValue = function (): any {
    return this.value;
  };
  YearCellEditor.prototype.isPopup = function (): any {
    return true;
  };
  YearCellEditor.prototype.init = function (params: any): any {

    this.value = params.value;
    this.data = params.data;
    this.field = params.colDef.field;
    const tempElement = document.createElement('div');

    let dt;
    let tt;

    if (this.data.PageDateFormat === 'Local') {
      dt = moment().format('YYYY-MM-DD');
      tt = moment().format('HH:mm');
    } else {
      dt = moment().utc().format('YYYY-MM-DD');
      tt = moment().utc().format('HH:mm');
    }

    if (this.value !== '-' && this.value != null) {
      if (this.data.PageDateFormat === 'Local') {
        dt = moment(this.value).format('YYYY-MM-DD');
        tt = moment(this.value).format('HH:mm');
      } else {
        dt = moment(this.value).utc().format('YYYY-MM-DD');
        tt = moment(this.value).utc().format('HH:mm');
      }
    }

    tempElement.innerHTML =
      '<div class="yearSelect">' +
      '<input class="gridinput" id="editorDate" style="width:130px; height:30px" type="date" value="' + dt + '">' +
      '<input class="gridinput" id="editorTime" style="width:130px; height:30px" type="time" value="' + tt + '">' +
      '<button id="btOK" class="yearButton" style="height:35px">OK</button>' +
      '<button id="btClear" class="yearButton" style="height:35px">Clear</button>' +
      '<button id="btEsc" class="yearButton" style="height:35px">Esc</button>' +
      '</div>';
    const that = this;


    tempElement
      .querySelector('#btOK')
      .addEventListener('click', () => {
        if (that.data.PageDateFormat === 'Local') {
          that.value = moment($('#editorDate').val() + 'T' + $('#editorTime').val()).format('YYYY-MM-DDTHH:mm:ss');
        } else {
          that.value = moment($('#editorDate').val() + 'T' + $('#editorTime').val() + 'Z').format('YYYY-MM-DDTHH:mm:ssZ');
        }
        // if (that.field === 'ActualEnd') {
        //   if (that.data.ActualStart === '-') {
        //     alert('Please set Actual Start first');
        //     params.stopEditing(false);
        //   } else {
        //     try {
        //       if (moment(that.value).isBefore(that.data.ActualStart)) {
        //         alert('Actual End cannot be before Actual Start');
        //         params.stopEditing(false);
        //       }
        //     } catch (ex) {
        //       alert('Please set Actual Start first');
        //       params.stopEditing(false);
        //     }
        //   }
        // }

        //       if (that.field === 'ActualStart' && that.data.ActualEnd !== '-') {
        //         // if (that.data.ActualStart === '-') {
        //         //   alert('Please set Actual Start first');
        //         //   that.value = null;
        //         // } else {
        //           try {
        //             if (moment(that.value).isAfter(that.data.ActualEnd)) {
        //               alert('Actual Start cannot be after Actual End');
        //               params.stopEditing(true);
        //             }
        //           } catch (ex) {
        //             alert('Actual Start cannot be after Actual End');
        //             params.stopEditing(true);
        //           }
        //  //       }
        //       }

        params.stopEditing();
      });
    tempElement
      .querySelector('#btClear')
      .addEventListener('click', () => {
        that.value = null;
        params.stopEditing();
      });
    tempElement
      .querySelector('#btEsc')
      .addEventListener('click', () => {
        params.stopEditing();
      });

    this.eGui = tempElement.firstChild;
  };
  return YearCellEditor;
}

function getTowReadyEditor(): any {
  function TowReadyCellEditor(): any { }
  TowReadyCellEditor.prototype.getGui = function (): any {
    return this.eGui;
  };
  TowReadyCellEditor.prototype.getValue = function (): any {
    return this.value;
  };
  TowReadyCellEditor.prototype.isPopup = function (): any {
    return true;
  };
  TowReadyCellEditor.prototype.init = function (params: any): any {

    this.value = params.value;
    this.data = params.data;
    this.field = params.colDef.field;
    const tempElement = document.createElement('div');

    if (this.value === 'R' || this.value === '' || this.value === null) {
      tempElement.innerHTML =
        '<div class="yearSelect">' +
        '<select class="gridinput" name="ready" id="ready" style="height:35px">' +
        '<option value="R" selected = "selected">R</option>' +
        '<option value="Wait for Instruction" >Wait for Instruction</option>' +
        '</select>' +
        '<button id="btOK" class="yearButton" style="height:35px">OK</button>' +
        '<button id="btClear" class="yearButton" style="height:35px">Clear</button>' +
        '<button id="btEsc" class="yearButton" style="height:35px">Esc</button>' +
        '</div>';
    }

    if (this.value === 'Wait for Instruction') {
      tempElement.innerHTML =
        '<div class="yearSelect">' +
        '<select class="gridinput" name="ready" id="ready" style="height:35px">' +
        '<option value="R">R</option>' +
        '<option value="Wait for Instruction" selected = "selected">Wait for Instruction</option>' +
        '</select>' +
        '<button id="btOK" class="yearButton" style="height:35px">OK</button>' +
        '<button id="btClear" class="yearButton" style="height:35px">Clear</button>' +
        '<button id="btEsc" class="yearButton" style="height:35px">Esc</button>' +
        '</div>';
    }
    const that = this;


    tempElement
      .querySelector('#btOK')
      .addEventListener('click', () => {
        that.value = $('#ready').val();
        params.stopEditing();
      });
    tempElement
      .querySelector('#btClear')
      .addEventListener('click', () => {
        that.value = null;
        params.stopEditing();
      });
    tempElement
      .querySelector('#btEsc')
      .addEventListener('click', () => {
        params.stopEditing();
      });

    $('#ready').val(this.value);
    this.eGui = tempElement.firstChild;
  };
  return TowReadyCellEditor;
}
