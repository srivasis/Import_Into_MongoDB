import { Component, OnInit} from '@angular/core';
import { DataService } from '../data.service';
import { Observable } from 'rxjs';

export interface TeamOnLeaderboard {
  rank: number;
  team_id: string;
  name: string;
  consistency_metric: number;
  maturity: number;
  score: number;
}

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css'],
})
export class LeaderboardComponent implements OnInit {
  dataSource: Observable<TeamOnLeaderboard[]>;
  result: any = [];
  columnsToDisplay = ['rank', 'team_id', 'name', 'consistency_metric', 'maturity', 'score'];

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.fetchTeamsForLeaderboard();
  }

  fetchTeamsForLeaderboard() {
    this.dataSource = this.dataService.getLeaderboardData();
  }
}
