import { SignalRService } from './services/signalr.service';
import { GlobalService } from './services/global.service';
import { Component, OnInit } from '@angular/core';

import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { CustomTooltip } from './custom-tooltip.component';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public displayMode = 'Rolling';
  public rowData: any;
  public getRowNodeId: any;
  public offsetFrom = -120;
  public offsetTo = 240;

  public rangeFrom: number;
  public rangeTo: number;
  public rangeDate: any;

  public showOnBlocks = true;
  public showDateRange = true;
  public enableDisplaySwitcher = false;
  public showCompleted = false;
  public tooltipShowDelay = 0;
  public frameworkComponents;

  public lastUpdate: string;
  public gridApi: any;
  public numRows: any;
  public status = 'Connecting';

  public columnDefs = [
    { headerName: 'Tow ID', field: 'TowingID', width: 120, sortable: true, hide: false },
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
    { headerName: 'From', field: 'From', width: 80, enableCellChangeFlash: true, flex: 1 },
    { headerName: 'To', field: 'To', width: 80, enableCellChangeFlash: true, flex: 1 },
    {
      headerName: 'Start', field: 'ScheduledStart', width: 120, sortable: true, enableCellChangeFlash: true,
      valueFormatter: this.timeFormatter, comparator: this.timeComparator
    },
    {
      headerName: 'End', field: 'ScheduledEnd', width: 100, sortable: true, enableCellChangeFlash: true,
      valueFormatter: this.timeFormatter, comparator: this.timeComparator
    },
    {
      headerName: 'Act. Start', field: 'ActualStart', width: 100, enableCellChangeFlash: true,
      valueFormatter: this.timeFormatter, cellStyle(params): any {
        if (params.data.Status === 'COMPLETED_DQM_ISSUES' && params.data.ActualStart === '-') {
          return { 'background-color': 'lightgray', color: 'black' };
        }
      }
    },
    { headerName: 'Act. End', field: 'ActualEnd', width: 100, enableCellChangeFlash: true, valueFormatter: this.timeFormatter },
    { headerName: 'A/C Type', field: 'AircraftType', width: 100, enableCellChangeFlash: true, },
    { headerName: 'A/C Rego', field: 'AircraftRegistration', width: 100, enableCellChangeFlash: true, },
    { headerName: 'Flights', field: 'Flights', tooltipField: 'Flights', flex: 3 }
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
    private ref: ChangeDetectorRef
  ) {

    this.getRowNodeId = (data: any) => {
      return data.TowingID;
    };
    this.frameworkComponents = { customTooltip: CustomTooltip };
    this.hubService.connectionEstablished.subscribe((connected: boolean) => {
      this.status = 'Connected';
      this.hubService.getTows(this.offsetFrom, this.offsetTo);
    });
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
  }

  onGridReady(params): void {
    this.gridApi = params.api;
    this.sortDefault();
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

}
