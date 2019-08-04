import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { TicketDataService, TeamAndSprint } from '../ticket-data.service';
import { DataService } from '../data.service';
import { TeamInfoService } from '../team-info.service';
import { TeamsPopupDataService } from '../teams-popup-data.service';
import { MatBottomSheet } from '@angular/material';
import { TeamsPopupComponent } from '../teams-popup/teams-popup.component';

export interface Ticket {
  _id: string;
  IssueKey: string;
  IssueID: number;
  IssueLink: string;
  Assignee: string;
  IssueStatus: string;
  Description: string;
}

@Component({
  selector: 'app-ticket-table',
  templateUrl: './ticket-table.component.html',
  styleUrls: ['./ticket-table.component.css']
})
export class TicketTableComponent implements OnInit {
  dataSource: Observable<Ticket[]>;
  teamName: string;
  sprintName: string;
  paramForData: string[];
  isLoading: boolean;
  subject: Subject<TeamAndSprint>;
  columnsToDisplay = ['IssueKey', 'IssueID', 'Assignee', 'IssueStatus', 'Description'];

  constructor(private ticketsDataService: TicketDataService, private dataService: DataService, private bottomSheet: MatBottomSheet,
              private popupService: TeamsPopupDataService, private teamMemberService: TeamInfoService) { }

  ngOnInit() {
    this.isLoading = true;
    this.subject = this.ticketsDataService.getSubject();
    this.subject.subscribe({
      next: (v) => {
        this.isLoading = false;
        this.teamName = v.teamName;
        this.sprintName = v.sprintName;
        this.dataSource = this.dataService.getSprintData(v.teamName, v.sprintName);
      }
    });
  }

  openTeamListForMember(option): void {
    this.popupService.setTeamsForMember(this.teamMemberService.getTeamsForEmployee(option));
    this.popupService.setTeamMemberName(option);
    this.bottomSheet.open(TeamsPopupComponent);
  }
}
