import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Observable, Subject } from 'rxjs';
import { ActivatedRoute, Router  } from '@angular/router';
import { TicketDataService, TeamAndSprint } from '../ticket-data.service';

export interface Sprint {
  _id: string;
}

@Component({
  selector: 'app-sprint-info',
  templateUrl: './sprint-info.component.html',
  styleUrls: ['./sprint-info.component.css']
})
export class SprintInfoComponent implements OnInit {
  dataSource: Observable<Sprint[]>;
  teamName: string;
  mostRecentSprint: string;
  subject: Subject<TeamAndSprint>;
  constructor(private dataService: DataService, private route: ActivatedRoute, private router: Router,
              private ticketsDataService: TicketDataService) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.teamName = params.teamName;
      this.fetchSprintsInfo(this.teamName);
      this.subject = this.ticketsDataService.getSubject();
    });
  }

  fetchSprintsInfo(teamID) {
    this.dataSource = this.dataService.getTeamSprintInfo(teamID);
    this.dataSource.subscribe(evt => this.spintData(evt[0]._id));
  }

  spintData(sprintNamePassed): void {
    this.subject.next({teamName: this.teamName, sprintName: sprintNamePassed});
  }
}
