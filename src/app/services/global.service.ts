import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  public minutesPerPixel = 1000 / 400;
  public zeroTime = moment().subtract(120, 'm');
  public rangeMode = 'offset';
  public offsetFrom = -1200;
  public offsetTo = 2400;
  public airports: any;
  public serverURL = 'http://localhost:8080/towwebsocket';
  public serverWebRoot = 'http://localhost:8080';
  public displayMode = 'ARR';
  public id = null;
  public token = null;
  public userStatus = 'Logged Out';
  constructor() { }
}
