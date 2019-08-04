import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

export interface TeamName {
  _id: string;
  name: string;
}

@Component({
  selector: 'app-team-page',
  templateUrl: './team-page.component.html',
  styleUrls: ['./team-page.component.css']
})
export class TeamPageComponent {
  teamName: Observable<TeamName>;
  displayName: string;

  constructor(private dataService: DataService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.teamName = this.dataService.getTeamName(params.teamName);
      this.teamName.subscribe(res => this.displayName = res.name);
    });
  }
}
