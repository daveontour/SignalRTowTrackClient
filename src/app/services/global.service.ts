import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  public rangeMode = 'offset';
  public offsetFrom = -300;
  public offsetTo = 240;
  public id = null;
  public token = null;
  public userStatus = 'Logged Out';
  public timeZone = 'Local';
  constructor() { }
}
