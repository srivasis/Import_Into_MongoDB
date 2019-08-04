import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.css']
})
export class EmployeeDashboardComponent implements OnInit {
  displayName: string;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {

      if (!params.employeeName.includes(',')) {
        this.displayName = params.employeeName;
      } else {
        let fullname = params.employeeName;
        if (params.employeeName.includes('-')) {
          fullname = fullname.split(' - ')[0];
        }
        const name = fullname.split(', ');
        this.displayName = name[1] + ' ' + name[0];
      }
    });
  }
}
