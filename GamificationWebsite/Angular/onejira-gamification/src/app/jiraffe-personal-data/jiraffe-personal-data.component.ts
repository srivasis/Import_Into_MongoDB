import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService } from '../data.service';
import { ActivatedRoute } from '@angular/router';

export interface JiraffeInfo {
  user_id: string;
  email: string;
  contact: string;
  team_id: string[];
  department: string;
  company: string;
  location: string;
  level: string;
  admin_pts: number;
  user_pts: number;
  tester_pts: number;
  developer_pts: number;
  total_pts: number;
}
@Component({
  selector: 'app-jiraffe-personal-data',
  templateUrl: './jiraffe-personal-data.component.html',
  styleUrls: ['./jiraffe-personal-data.component.css']
})
export class JiraffePersonalDataComponent implements OnInit {

  dataSource: Observable<JiraffeInfo>;
  employeeName: string;

  constructor(private dataService: DataService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.employeeName = params.employeeName;
      this.setEmployeeInfo(this.employeeName);
    });
  }

  setEmployeeInfo(employeeName) {
    this.dataSource = this.dataService.getIndivJiraffeInfo(employeeName);
  }

}
