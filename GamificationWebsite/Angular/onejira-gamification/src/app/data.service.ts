import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TeamOnLeaderboard } from './leaderboard/leaderboard.component';
import { VelocityData } from './velocity/velocity.component';
import { TeamMember } from './team-roster/team-roster.component';
import { Sprint } from './sprint-info/sprint-info.component';
import { Ticket } from './ticket-table/ticket-table.component';
import { IndivVel } from './indiv-velocity/indiv-velocity.component';
import { TeamMaturity } from './maturity-graph-table/maturity-graph-table.component';
import { JiraffeIndivLeaderboard } from './jiraffe-indiv-leaderboard/jiraffe-indiv-leaderboard.component';
import { JiraffeTeamLeaderboard } from './jiraffe-team-leaderboard/jiraffe-team-leaderboard.component';
import { JiraffeInfo } from './jiraffe-personal-data/jiraffe-personal-data.component';
import { TeamName } from './team-page/team-page.component';
import { EmployeeMaturity } from './indiv-maturity/indiv-maturity.component';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  uri = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  getLeaderboardData(): Observable<TeamOnLeaderboard[]> {
    return this.http.get<TeamOnLeaderboard[]>(`${this.uri}/rest/leaderboard.json`);
  }

  getJiraffeIndivLeaderboardData(): Observable<JiraffeIndivLeaderboard[]> {
    return this.http.get<JiraffeIndivLeaderboard[]>(`${this.uri}/rest/jiraffe-indiv-leaderboard.json`);
  }

  getJiraffeTeamLeaderboardData(): Observable<JiraffeTeamLeaderboard[]> {
    return this.http.get<JiraffeTeamLeaderboard[]>(`${this.uri}/rest/jiraffe-team-leaderboard.json`);
  }

  getVelocityData(teamID): Observable<VelocityData> {
    return this.http.get<VelocityData>(`${this.uri}/rest/team-velocity.json?${teamID}`);
  }

  getTeamRoster(teamID): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${this.uri}/rest/team-members.json?${teamID}`);
  }

  getTeamSprintInfo(teamID): Observable<Sprint[]> {
    return this.http.get<Sprint[]>(`${this.uri}/rest/sprints-list.json?${teamID}`);
  }

  getMaturitySprints(teamID): Observable<Sprint[]> {
    return this.http.get<Sprint[]>(`${this.uri}/rest/maturity-sprint-list.json?${teamID}`);
  }

  getSprintData(teamID, sprintName): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.uri}/rest/sprints.json?${teamID}?${sprintName}`);
  }

  getMaturityData(teamID, sprintName): Observable<TeamMaturity> {
    return this.http.get<TeamMaturity>(`${this.uri}/rest/team-maturity.json?${teamID}?${sprintName}`);
  }

  getTeamList() {
    return this.http.get(`${this.uri}/rest/team-and-names.json`);
  }

  getTeamsAndMembers() {
    return this.http.get(`${this.uri}/rest/team-list-with-members.json`);
  }

  getIndivVel(teamID): Observable<IndivVel[]> {
    return this.http.get<IndivVel[]>(`${this.uri}/rest/individual-committed-completed.json?${teamID}`);
  }

  getIndivJiraffeInfo(name): Observable<JiraffeInfo> {
    return this.http.get<JiraffeInfo>(`${this.uri}/rest/jiraffe-employee-info.json?${name}`);
  }

  getTeamName(teamID): Observable<TeamName> {
    return this.http.get<TeamName>(`${this.uri}/rest/team-name.json?${teamID}`);
  }

  getEmployeeMaturity(employeeName): Observable<EmployeeMaturity[]> {
    return this.http.get<EmployeeMaturity[]>(`${this.uri}/rest/individual-maturity.json?${employeeName}`);
  }
}
