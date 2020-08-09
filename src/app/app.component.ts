import { SignalRService } from './services/signalr.service';
import { GlobalService } from './services/global.service';
import { Component, OnInit, Inject } from '@angular/core';

import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { CustomTooltip } from './custom-tooltip.component';
import { CustomPlanTooltip } from './custom-plan-tooltip.component';
import { ChangeDetectorRef } from '@angular/core';

import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LoginDialog } from './login-dialog.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public displayMode = 'Rolling';
  public rowData: any;
  public getRowNodeId: any;
  public offsetFrom = -300;
  public offsetTo = 240;

  public rangeFrom: number;
  public rangeTo: number;
  public rangeDate: any;

  public editorDate: any;
  public editorTime: any;

  public showOnBlocks = true;
  public showDateRange = false;
  public enableDisplaySwitcher = false;
  public showCompleted = false;
  public tooltipShowDelay = 0;
  public frameworkComponents;

  public lastUpdate: string;
  public gridApi: any;
  public gridColumnApi: any;
  public numRows: any;
  public status = 'Connecting';
  public components;
  public enableReady = false;
  public columnDefs = [
    { headerName: 'Tow ID', field: 'TowingID', tooltipComponent: 'customPlanTooltip', tooltipField: 'TowingID' },
    {
      headerName: 'Status', field: 'Status', sortable: true, flex: 3, comparator: this.statusComparator, valueGetter: this.statusGetter,
      cellStyle(params): any {

        if (params.data.Status === 'NOT_STARTED') {
          return { 'background-color': 'red', color: 'black' };
        }
        if (params.data.Status === 'SCHEDULED') {
          return { 'background-color': 'lime', color: 'black' };
        }
        if (params.data.Status === 'STARTED' || params.data.Status === 'STARTED_EARLY' || params.data.Status === 'STARTED_LATE') {
          return { 'background-color': 'yellow', color: 'black' };
        }
        if (params.data.Status === 'COMPLETED' || params.data.Status === 'COMPLETED_EARLY' || params.data.Status === 'COMPLETED_LATE') {
          return { 'background-color': 'gray' };
        }
        if (params.data.Status === 'COMPLETED_DQM_ISSUES') {
          return { 'background-color': 'lightgray', color: 'black' };
        }
        if (params.data.Status === 'STARTED_RUNNING_OVERTIME') {
          return { 'background-color': 'lightcoral', color: 'black' };
        }
        return { 'background-color': 'gray' };
      }
    },
    { headerName: 'Ready', field: 'Ready', colId: 'ReadyEdit', flex: 1, editable: true, cellEditor: 'readyCellEditor', hide: true },
    { headerName: 'Ready', field: 'Ready', colId: 'Ready', flex: 1 },
    { headerName: 'From', field: 'From', tooltipField: 'Flights', flex: 1 },
    { headerName: 'To', field: 'To', tooltipField: 'Flights', flex: 1 },
    // tslint:disable-next-line:max-line-length
    { headerName: 'Start', field: 'ScheduledStart', width: 120, sortable: true, valueFormatter: this.timeFormatter, comparator: this.timeComparator },
    { headerName: 'End', field: 'ScheduledEnd', sortable: true, valueFormatter: this.timeFormatter, comparator: this.timeComparator },
    // tslint:disable-next-line:max-line-length
    { headerName: 'Act. Start', field: 'ActualStart', colId: 'ActualStartEdit', editable: true, cellEditor: 'yearCellEditor', valueFormatter: this.timeFormatter, hide: true },
    { headerName: 'Act. End', field: 'ActualEnd', colId: 'ActualEndEdit', valueFormatter: this.timeFormatter, editable: true, cellEditor: 'yearCellEditor', hide: true },
    { headerName: 'Act. Start', field: 'ActualStart', colId: 'ActualStart', valueFormatter: this.timeFormatter },
    { headerName: 'Act. End', field: 'ActualEnd', colId: 'ActualEnd', valueFormatter: this.timeFormatter },
    { headerName: 'A/C Type', field: 'AircraftType' },
    { headerName: 'A/C Rego', field: 'AircraftRegistration' },
    { headerName: 'Flights', field: 'Flights', tooltipField: 'TowingID', flex: 3, tooltipComponent: 'customPlanTooltip', }
  ];
  defaultColDef = {
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
    private http: HttpClient,
    public globals: GlobalService,
    public hubService: SignalRService,
    private ref: ChangeDetectorRef,
    private dialog: MatDialog,
    // private snackBar: MatSnackBar

  ) {

    this.getRowNodeId = (data: any) => {
      return data.TowingID;
    };
    this.frameworkComponents = { customTooltip: CustomTooltip, customPlanTooltip: CustomPlanTooltip };
    this.hubService.connectionEstablished.subscribe((connected: boolean) => {
      this.status = 'Connected';
      this.hubService.checkEnableReady();
      this.hubService.getTows(this.offsetFrom, this.offsetTo);
    });

    this.components = { yearCellEditor: getYearCellEditor(), readyCellEditor: getTowReadyEditor() };
  }

  statusComparator(status1: string, status2: string): any {
    const priMap = new Map([
      ['Scheduled', 50],
      ['Not Started', 1],
      ['Started (Late)', 20],
      ['Started (Early)', 21],
      ['Started', 22],
      ['Completed', 80],
      ['Completed (DQM Issue)', 25],
      ['Completed (Early)', 27],
      ['Completed (Late)', 26],
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
    return m.format('HH:mm');
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

  login(): any {
    this.hubService.login('Dave', 'WAS');
  }
  logout(): any {
    this.hubService.logout();
  }

  ngOnInit(): void {
    this.subscribeToEvents();
  }

  private subscribeToEvents(): void {
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
      that.loadGrid(message);
    });
    this.hubService.connectionError.subscribe((message: string) => {
      that.status = 'Disconnected';
    });
    this.hubService.connectionEstablishing.subscribe((message: string) => {
      that.status = 'Connecting';
    });

    this.hubService.allowActualEndUpdate.subscribe((allow: boolean) => {
      that.gridColumnApi.setColumnsVisible(['ActualEnd'], !allow);
      that.gridColumnApi.setColumnsVisible(['ActualEndEdit'], allow);
    });

    this.hubService.allowActualStartUpdate.subscribe((allow: boolean) => {
      that.gridColumnApi.setColumnsVisible(['ActualStart'], !allow);
      that.gridColumnApi.setColumnsVisible(['ActualStartEdit'], allow);
    });

    this.hubService.allowReadyUpdate.subscribe((allow: boolean) => {
      if (that.enableReady) {
        that.gridColumnApi.setColumnsVisible(['Ready'], !allow);
        that.gridColumnApi.setColumnsVisible(['ReadyEdit'], allow);
      }
    });
    this.hubService.enableReadyCB.subscribe((enable: boolean[]) => {
      that.enableReady = enable[0];
      that.gridColumnApi.setColumnsVisible(['Ready'], enable[0]);
      that.gridColumnApi.setColumnsVisible(['ReadyEdit'], false);

      // Show the  logon buttons
      if (enable[1]) {
        $('#loginBtn').show(0);
        $('#logoutBtn').show(0);
      }
      // Show the range selector
      if (enable[2]) {
        that.showDateRange = true;
      }
    });
  }

  onGridReady(params): void {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.sortDefault();
  }

  onCellValueChanged(evt: any): void {
    console.log(evt);
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

        if (that.checkAddRow(element)) {
          rowsToAdd.push(element);
        }
      } catch (ex) {
        console.log(ex);
      }
    });

    this.lastUpdate = moment().format('HH:mm:ss');

    this.rowData = rowsToAdd;
    this.numRows = rowsToAdd.length;
    this.ref.markForCheck();
  }
  updateGridRow(updatedTow: any): void {

    if (this.checkAddRow(updatedTow)) {
      updatedTow = this.transformRow(updatedTow);
      const itemsToUpdate = [];
      itemsToUpdate.push(updatedTow);
      console.log(updatedTow);
      this.gridApi.updateRowData({ update: itemsToUpdate });
      this.numRows = this.gridApi.getDisplayedRowCount();
    } else {
      const itemsToRemove = [updatedTow];
      this.gridApi.updateRowData({ remove: itemsToRemove });
      this.numRows = this.gridApi.getDisplayedRowCount();
    }

    this.lastUpdate = moment().format('HH:mm:ss');

  }

  addGridRow(addTow: any): void {
    addTow = this.transformRow(addTow);
    if (this.checkAddRow(addTow)) {
      const itemsToAdd = [addTow];
      this.gridApi.updateRowData({ add: itemsToAdd });
      this.lastUpdate = moment().format('HH:mm:ss');
      this.numRows = this.gridApi.getDisplayedRowCount();
    }
  }

  deleteGridRow(removeTow: any): void {
    const itemsToRemove = [removeTow];
    this.gridApi.updateRowData({ remove: itemsToRemove });
    this.lastUpdate = moment().format('HH:mm:ss');
    this.numRows = this.gridApi.getDisplayedRowCount();
  }

  refresh(): any {
    this.loadData();
  }
  loadData(): any {
    this.hubService.getTows(this.offsetFrom, this.offsetTo);
  }
  transformRow(row: any): any {

    if (row.ArrivalFlightDescriptor !== null) {
      row.Arrival = row.ArrivalFlightDescriptor.replace('@', ' ');
      row.Arrival = row.Arrival.replace('T', ' ');
      row.Arrival = row.Arrival.substring(0, row.Arrival.length - 1);

    } else {
      row.Arrival = '-';
      row.ArrivalAirlineCode = '';
      row.ArrivalFltNum = '';
    }

    if (row.DepartureFlightDescriptor !== null) {
      row.Departure = row.DepartureFlightDescriptor.replace('@', ' ');
      row.Departure = row.Departure.replace('T', ' ');
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

    return row;
  }
  checkAddRow(updatedTow: any): boolean {

    const towTime = moment(updatedTow.ScheduledStart);
    const diff = towTime.diff(moment(), 'minutes');
    if (diff < this.globals.offsetFrom || diff > this.globals.offsetTo) {
      return false;
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

  setCurrentRange(): any {
    this.globals.rangeMode = 'offset';
    this.displayMode = 'Rolling';
    this.globals.offsetFrom = this.offsetFrom;
    this.globals.offsetTo = this.offsetTo;
    this.globals.zeroTime = moment().add(this.offsetFrom, 'minutes');
    // this.director.minuteTick();
    this.loadData();
  }

  setSelectedRange(): any {
    this.globals.rangeMode = 'range';
    this.displayMode = 'Fixed';

    const mss = this.rangeDate + ' ' + this.rangeFrom;
    const ms = moment(mss, 'YYYY-MM-DD HH:mm');

    const mse = this.rangeDate + ' ' + this.rangeTo;
    const me = moment(mse, 'YYYY-MM-DD HH:mm');

    this.offsetFrom = ms.diff(moment(), 'm');
    this.offsetTo = me.diff(moment(), 'm');
    this.globals.offsetFrom = this.offsetFrom;
    this.globals.offsetTo = this.offsetTo;


    this.globals.zeroTime = moment().add(this.offsetFrom, 'minutes');

    this.hubService.getTowsOneOff(this.offsetFrom, this.offsetTo);

  }

  getRangeBulletClass(): any {
    if (this.globals.rangeMode !== 'offset') {
      return 'show';
    } else {
      return 'hide';
    }
  }
  getOffsetBulletClass(): any {
    if (this.globals.rangeMode === 'offset') {
      return 'show';
    } else {
      return 'hide';
    }
  }

  openDialog(): any {

    const that = this;
    const dialogRef = this.dialog.open(LoginDialog, {
      data: {
        message: 'Login for edit access',
        buttonText: {
          ok: 'Login',
          cancel: 'Cancel'
        }
      }
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data.confirmed) {
        that.hubService.login(data.id, data.token);
        const a = document.createElement('a');
        a.click();
        a.remove();
      }
    });
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

    let dt = moment().format('YYYY-MM-DD');
    let tt = moment().format('HH:mm');

    if (this.value !== '-' && this.value != null) {
      dt = moment(this.value).format('YYYY-MM-DD');
      tt = moment(this.value).format('HH:mm');
    }

    tempElement.innerHTML =
      '<div class="yearSelect">' +
      '<input class="gridinput" id="editorTime" style="width:130px; height:30px" type="time" value="' + tt + '">' +
      '<input class="gridinput" id="editorDate" style="width:130px; height:30px" type="date" value="' + dt + '">' +
      '<button id="btOK" class="yearButton" style="height:35px">OK</button>' +
      '<button id="btClear" class="yearButton" style="height:35px">Clear</button>' +
      '<button id="btEsc" class="yearButton" style="height:35px">Esc</button>' +
      '</div>';
    const that = this;


    tempElement
      .querySelector('#btOK')
      .addEventListener('click', function (): any {
        that.value = moment($('#editorDate').val() + 'T' + $('#editorTime').val()).format('YYYY-MM-DDTHH:mm:ss');

        if (that.field === 'ActualEnd') {
          if (that.data.ActualStart === '-') {
            alert('Please set Actual Start first');
            that.value = null;
          } else {
            try {
              if (moment(that.value).isBefore(that.data.ActualStart)) {
                alert('Actual End cannot be before Actual Start');
                that.value = null;
              }
            } catch (ex) {
              alert('Please set Actual Start first');
              that.value = null;
            }
          }
        }

        if (that.field === 'ActualStart' && that.data.ActualEnd !== '-') {
          if (that.data.ActualStart === '-') {
            alert('Please set Actual Start first');
            that.value = null;
          } else {
            try {
              if (moment(that.value).isAfter(that.data.ActualEnd)) {
                alert('Actual Start cannot be after Actual End');
                that.value = null;
              }
            } catch (ex) {
              alert('Actual Start cannot be after Actual End');
              that.value = null;
            }
          }
        }

        params.stopEditing();
      });
    tempElement
      .querySelector('#btClear')
      .addEventListener('click', function (): any {
        that.value = null;
        params.stopEditing();
      });
    tempElement
      .querySelector('#btEsc')
      .addEventListener('click', function (): any {
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
        '<option value="Finished">Finished</option>' +
        '<option value="Wait for confirmation" >Wait for confirmation</option>' +
        '</select>' +
        '<button id="btOK" class="yearButton" style="height:35px">OK</button>' +
        '<button id="btClear" class="yearButton" style="height:35px">Clear</button>' +
        '<button id="btEsc" class="yearButton" style="height:35px">Esc</button>' +
        '</div>';
    }
    if (this.value === 'Finished') {
      tempElement.innerHTML =
        '<div class="yearSelect">' +
        '<select class="gridinput" name="ready" id="ready" style="height:35px">' +
        '<option value="R">R</option>' +
        '<option value="Finished" selected = "selected">Finished</option>' +
        '<option value="Wait for confirmation" >Wait for confirmation</option>' +
        '</select>' +
        '<button id="btOK" class="yearButton" style="height:35px">OK</button>' +
        '<button id="btClear" class="yearButton" style="height:35px">Clear</button>' +
        '<button id="btEsc" class="yearButton" style="height:35px">Esc</button>' +
        '</div>';
    }

    if (this.value === 'Wait for confirmation') {
      tempElement.innerHTML =
        '<div class="yearSelect">' +
        '<select class="gridinput" name="ready" id="ready" style="height:35px">' +
        '<option value="R">R</option>' +
        '<option value="Finished" >Finished</option>' +
        '<option value="Wait for confirmation" selected = "selected">Wait for confirmation</option>' +
        '</select>' +
        '<button id="btOK" class="yearButton" style="height:35px">OK</button>' +
        '<button id="btClear" class="yearButton" style="height:35px">Clear</button>' +
        '<button id="btEsc" class="yearButton" style="height:35px">Esc</button>' +
        '</div>';
    }
    const that = this;


    tempElement
      .querySelector('#btOK')
      .addEventListener('click', function (): any {
        that.value = $('#ready').val();
        params.stopEditing();
      });
    tempElement
      .querySelector('#btClear')
      .addEventListener('click', function (): any {
        that.value = null;
        params.stopEditing();
      });
    tempElement
      .querySelector('#btEsc')
      .addEventListener('click', function (): any {
        params.stopEditing();
      });

    $('#ready').val(this.value);
    this.eGui = tempElement.firstChild;
  };
  return TowReadyCellEditor;
}




