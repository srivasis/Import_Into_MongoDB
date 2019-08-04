import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Observable } from 'rxjs';

export interface JiraffeTeamLeaderboard {
  rank: number;
  team_id: string;
  team_name: string;
  score: number;
}

@Component({
  selector: 'app-jiraffe-team-leaderboard',
  templateUrl: './jiraffe-team-leaderboard.component.html',
  styleUrls: ['./jiraffe-team-leaderboard.component.css']
})
export class JiraffeTeamLeaderboardComponent implements OnInit {
  dataSource: Observable<JiraffeTeamLeaderboard[]>;
  result: any = [];
  columnsToDisplay = ['rank', 'team_id', 'team_name', 'score'];

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.fetchTeamsForLeaderboard();
  }

  fetchTeamsForLeaderboard() {
    this.dataSource = this.dataService.getJiraffeTeamLeaderboardData();
  }
}
