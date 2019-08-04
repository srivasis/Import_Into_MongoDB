import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { TeamsPopupDataService } from '../teams-popup-data.service';
import { MatBottomSheet } from '@angular/material';
import { TeamsPopupComponent } from '../teams-popup/teams-popup.component';
import { TeamInfoService } from '../team-info.service';

export interface TeamMember {
  name: string;
  email: string;
}

@Component({
  selector: 'app-team-roster',
  templateUrl: './team-roster.component.html',
  styleUrls: ['./team-roster.component.css']
})
export class TeamRosterComponent implements OnInit {

  dataSource: Observable<TeamMember[]>;
  teamName: string;
  isLoading: boolean;
  columnsToDisplay = ['name', 'email'];

  constructor(private dataService: DataService, private route: ActivatedRoute, private bottomSheet: MatBottomSheet,
              private popupService: TeamsPopupDataService, private teamMemberService: TeamInfoService) { }

  ngOnInit() {
    this.isLoading = true;
    this.route.params.subscribe(params => {
      this.teamName = params.teamName;
      this.setRoster(this.teamName);
    });
  }

  setRoster(teamID) {
    this.dataSource = this.dataService.getTeamRoster(teamID);
    this.dataSource.subscribe(res => this.isLoading = false);
  }

  openTeamListForMember(option): void {
    this.popupService.setTeamsForMember(this.teamMemberService.getTeamsForEmployee(option));
    this.popupService.setTeamMemberName(option);
    this.bottomSheet.open(TeamsPopupComponent);
  }
}
