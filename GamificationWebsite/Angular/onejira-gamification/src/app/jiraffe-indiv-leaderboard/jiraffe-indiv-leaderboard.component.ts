import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Observable } from 'rxjs';
import { MatBottomSheet } from '@angular/material';
import { TeamInfoService } from '../team-info.service';
import { TeamsPopupDataService } from '../teams-popup-data.service';
import { TeamsPopupComponent } from '../teams-popup/teams-popup.component';

export interface JiraffeIndivLeaderboard {
  rank: number;
  employee_name: string;
  score: number;
  team_name: string;
}

@Component({
  selector: 'app-jiraffe-indiv-leaderboard',
  templateUrl: './jiraffe-indiv-leaderboard.component.html',
  styleUrls: ['./jiraffe-indiv-leaderboard.component.css']
})
export class JiraffeIndivLeaderboardComponent implements OnInit {
  dataSource: Observable<JiraffeIndivLeaderboard[]>;
  result: any = [];
  columnsToDisplay = ['rank', 'employee_name', 'team_name', 'score'];

  constructor(private dataService: DataService, private bottomSheet: MatBottomSheet,
              private popupService: TeamsPopupDataService, private teamMemberService: TeamInfoService) { }

  ngOnInit() {
    this.fetchTeamsForLeaderboard();
  }

  fetchTeamsForLeaderboard() {
    this.dataSource = this.dataService.getJiraffeIndivLeaderboardData();
  }

  openTeamListForMember(option): void {
    this.popupService.setTeamsForMember(this.teamMemberService.getTeamsForEmployee(option));
    this.popupService.setTeamMemberName(option);
    this.bottomSheet.open(TeamsPopupComponent);
  }
}
