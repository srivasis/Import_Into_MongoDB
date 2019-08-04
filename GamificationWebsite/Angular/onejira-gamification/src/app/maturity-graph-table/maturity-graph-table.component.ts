import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { TeamAndSprint } from '../ticket-data.service';
import { DataService } from '../data.service';
import { MaturitySelectionService } from '../maturity-selection.service';
import { Label } from 'ng2-charts';
import { ChartType, ChartOptions } from 'chart.js';
import { TeamInfoService } from '../team-info.service';
import { TeamsPopupDataService } from '../teams-popup-data.service';
import { MatBottomSheet } from '@angular/material';
import { TeamsPopupComponent } from '../teams-popup/teams-popup.component';

export interface TeamMaturity {
  name: string;
  maturePoints: number;
  totalStoryPoints: number;
  matureIssueCount: number;
  totalIssueCount: number;
  arrOfImmatureIssues: any[];
}

@Component({
  selector: 'app-maturity-graph-table',
  templateUrl: './maturity-graph-table.component.html',
  styleUrls: ['./maturity-graph-table.component.css']
})
export class MaturityGraphTableComponent implements OnInit {
  dataSource: Observable<TeamMaturity>;
  teamName: string;
  sprintName: string;
  subject: Subject<TeamAndSprint>;
  receivedData: TeamMaturity;
  maturity: string;
  columnsToDisplay = ['IssueKey', 'StoryPoints', 'Assignee'];

  public pieChartOptions: ChartOptions = {
    responsive: true,
    legend: {
      position: 'top',
    }
  };
  public pieChartLabels: Label[] = ['Early/On-time Issues', 'Late Issues'];
  public pieChartData: number[];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartColors = [
    {
      backgroundColor: ['rgba(0,255,0,0.3)', 'rgba(255,0,0,0.3)'],
    },
  ];


  constructor(private maturityService: MaturitySelectionService, private dataService: DataService, private bottomSheet: MatBottomSheet,
              private popupService: TeamsPopupDataService, private teamMemberService: TeamInfoService) { }

  ngOnInit() {
    this.subject = this.maturityService.getSubject();
    this.subject.subscribe({
      next: (v) => {
        this.teamName = v.teamName;
        this.sprintName = v.sprintName;
        this.dataSource = this.dataService.getMaturityData(v.teamName, v.sprintName);
        this.setGraph();
      }
    });
  }

  setGraph() {
    this.dataSource.subscribe((res) => {
      this.receivedData = res as TeamMaturity;
      this.maturity = ((this.receivedData.maturePoints / this.receivedData.totalStoryPoints) * 100).toFixed(3);
      this.pieChartData = [res.matureIssueCount, res.totalIssueCount - res.matureIssueCount];
    });
  }

  openTeamListForMember(option): void {
    this.popupService.setTeamsForMember(this.teamMemberService.getTeamsForEmployee(option));
    this.popupService.setTeamMemberName(option);
    this.bottomSheet.open(TeamsPopupComponent);
  }

}
