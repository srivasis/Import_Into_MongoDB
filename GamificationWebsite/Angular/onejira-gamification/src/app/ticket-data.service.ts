import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { DataService } from './data.service';

export interface TeamAndSprint {
  teamName: string;
  sprintName: string;
}

@Injectable({
  providedIn: 'root'
})
export class TicketDataService {

  subject = new Subject<TeamAndSprint>();
  constructor() { }

  getSubject() {
    return this.subject;
  }
}
