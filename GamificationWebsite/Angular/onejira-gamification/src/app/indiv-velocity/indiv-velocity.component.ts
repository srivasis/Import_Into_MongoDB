import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { TeamsPopupComponent } from '../teams-popup/teams-popup.component';
import { TeamInfoService } from '../team-info.service';
import { MatBottomSheet } from '@angular/material';
import { TeamsPopupDataService } from '../teams-popup-data.service';

export interface IndivVel {
  member: string;
  overallCommit: number;
  overallComplete: number;
  threeSprintCommit: number;
  threeSprintComplete: number;
}

@Component({
  selector: 'app-indiv-velocity',
  templateUrl: './indiv-velocity.component.html',
  styleUrls: ['./indiv-velocity.component.css']
})
export class IndivVelocityComponent implements OnInit {

  dataSource: Observable<IndivVel[]>;
  teamName: string;
  isLoading: boolean;
  columnsToDisplay = ['member', 'threeSprintCommit', 'threeSprintComplete',
  'overallCommit', 'overallComplete'];

  constructor(private dataService: DataService, private route: ActivatedRoute, private bottomSheet: MatBottomSheet,
              private popupService: TeamsPopupDataService, private teamMemberService: TeamInfoService) { }

  ngOnInit() {
    this.isLoading = true;
    this.route.params.subscribe(params => {
      this.teamName = params.teamName;
      this.getIndivVelocity(this.teamName);
    });
  }

  getIndivVelocity(teamID) {
    this.dataSource = this.dataService.getIndivVel(teamID);
    this.dataSource.subscribe(res => this.isLoading = false);
  }

  openTeamListForMember(option): void {
    this.popupService.setTeamsForMember(this.teamMemberService.getTeamsForEmployee(option));
    this.popupService.setTeamMemberName(option);
    this.bottomSheet.open(TeamsPopupComponent);
  }
}
