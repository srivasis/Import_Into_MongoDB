import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService } from '../data.service';
import { ActivatedRoute } from '@angular/router';

export interface EmployeeMaturity {
  team_id: string;
  sprint: string;
  ticket_id: string;
  story_points: number;
  maturity_status: string;
}

@Component({
  selector: 'app-indiv-maturity',
  templateUrl: './indiv-maturity.component.html',
  styleUrls: ['./indiv-maturity.component.css']
})
export class IndivMaturityComponent implements OnInit {
  dataSource: Observable<EmployeeMaturity[]>;
  displayedColumns: string[] = ['team_id', 'sprint', 'ticket_id', 'story_points', 'maturity_status'];
  employeeName: string;
  totalSP = 0;
  lateSP = 0;
  maturity: string;

  constructor(private dataService: DataService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.employeeName = params.employeeName;
      this.setTable(this.employeeName);
    });
  }

  setTable(employee) {
    this.dataSource = this.dataService.getEmployeeMaturity(employee);
    this.dataSource.subscribe(res => {
      for (const i of res) {
        this.totalSP += i.story_points;
        if (i.maturity_status === 'Late') {
          this.lateSP += i.story_points;
        }
      }
      this.maturity = (((this.totalSP - this.lateSP) / this.totalSP) * 100).toFixed(3);
    });
  }

}
