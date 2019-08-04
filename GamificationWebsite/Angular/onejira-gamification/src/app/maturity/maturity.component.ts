import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Observable, Subject } from 'rxjs';
import { ActivatedRoute, Router  } from '@angular/router';
import { TeamAndSprint } from '../ticket-data.service';
import { Sprint } from '../sprint-info/sprint-info.component';
import { MaturitySelectionService } from '../maturity-selection.service';

@Component({
  selector: 'app-maturity',
  templateUrl: './maturity.component.html',
  styleUrls: ['./maturity.component.css']
})
export class MaturityComponent implements OnInit {
  dataSource: Observable<Sprint[]>;
  teamName: string;
  mostRecentSprint: string;
  subject: Subject<TeamAndSprint>;
  constructor(private dataService: DataService, private route: ActivatedRoute, private router: Router,
              private maturitySelection: MaturitySelectionService) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.teamName = params.teamName;
      this.fetchSprintsInfo(this.teamName);
      this.subject = this.maturitySelection.getSubject();
    });
  }

  fetchSprintsInfo(teamID) {
    this.dataSource = this.dataService.getMaturitySprints(teamID);
    this.dataSource.subscribe(evt => this.spintData(evt[0]._id));
  }

  spintData(sprintNamePassed): void {
    this.subject.next({teamName: this.teamName, sprintName: sprintNamePassed});
  }
}
