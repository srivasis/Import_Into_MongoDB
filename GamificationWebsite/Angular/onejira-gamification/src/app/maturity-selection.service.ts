import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { DataService } from './data.service';
import { TeamAndSprint } from './ticket-data.service';

@Injectable({
  providedIn: 'root'
})
export class MaturitySelectionService {

  subject = new Subject<TeamAndSprint>();
  constructor(private dataService: DataService) { }

  getSubject() {
    return this.subject;
  }
}
