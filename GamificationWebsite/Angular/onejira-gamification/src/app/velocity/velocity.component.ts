import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

export interface VelocityData {
  teamName: string;
  avgCommit: number;
  avgComplete: number;
  consistency: number;
  avgCommitThreeSprints: number;
  avgCompleteThreeSprints: number;
  committedVelocities: number[];
  completedVelocities: number[];
  sprints: string[];
}

@Component({
  selector: 'app-velocity',
  templateUrl: './velocity.component.html',
  styleUrls: ['./velocity.component.css']
})
export class VelocityComponent implements OnInit {
  dataSource: Observable<VelocityData>;
  teamName: string;
  receivedData: VelocityData;

  public chartOptions = {
    scaleShowVerticalLines: false,
    responsive: true
  };
  public chartLabels;
  public chartType;
  public chartLegend;
  public chartData;

  constructor(private dataService: DataService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.teamName = params.teamName;
      this.fetchVelocityData(this.teamName);
      this.setGraph();
    });
  }

  fetchVelocityData(teamID) {
    this.dataSource = this.dataService.getVelocityData(teamID);
  }

  setGraph() {
    this.dataSource.subscribe((res) => {
      this.receivedData = res as VelocityData;
      this.chartLabels = this.receivedData.sprints;
      this.chartType = 'horizontalBar';
      this.chartLegend = true;
      this.chartData = [
        {data: this.receivedData.committedVelocities, label: 'Committed Velocity'},
        {data: this.receivedData.completedVelocities, label: 'Completed Velocity'}
      ];
    });
  }
}
