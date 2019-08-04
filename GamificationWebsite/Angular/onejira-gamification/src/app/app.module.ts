import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';

import { MaterialModule } from './material';

import { DataService } from './data.service';
import { TeamsPopupDataService } from './teams-popup-data.service';
import { SearchTeamComponent } from './search-team/search-team.component';
import { TeamsPopupComponent } from './teams-popup/teams-popup.component';
import { TeamPageComponent } from './team-page/team-page.component';
import { VelocityComponent } from './velocity/velocity.component';

import { TeamRosterComponent } from './team-roster/team-roster.component';
import { SprintInfoComponent } from './sprint-info/sprint-info.component';
import { TicketTableComponent } from './ticket-table/ticket-table.component';
import { TicketDataService } from './ticket-data.service';
import { IndivVelocityComponent } from './indiv-velocity/indiv-velocity.component';

import { LoginDialog } from './header/header.component';
import { MaturityComponent } from './maturity/maturity.component';
import { MaturitySelectionService } from './maturity-selection.service';
import { MaturityGraphTableComponent } from './maturity-graph-table/maturity-graph-table.component';
import { AuthGuard } from './header/auth.guard';
import { JiraffeIndivLeaderboardComponent } from './jiraffe-indiv-leaderboard/jiraffe-indiv-leaderboard.component';
import { JiraffeTeamLeaderboardComponent } from './jiraffe-team-leaderboard/jiraffe-team-leaderboard.component';
import { HomePageComponent } from './home-page/home-page.component';
import { TeamInfoService } from './team-info.service';
import { EmployeeDashboardComponent } from './employee-dashboard/employee-dashboard.component';
import { JiraffePersonalDataComponent } from './jiraffe-personal-data/jiraffe-personal-data.component';
import { IndivMaturityComponent } from './indiv-maturity/indiv-maturity.component';

@NgModule({
  declarations: [
    AppComponent,
    LeaderboardComponent,
    HeaderComponent,
    SearchTeamComponent,
    TeamsPopupComponent,
    TeamPageComponent,
    VelocityComponent,
    TeamRosterComponent,
    SprintInfoComponent,
    TicketTableComponent,
    IndivVelocityComponent,
    LoginDialog,
    MaturityComponent,
    MaturityGraphTableComponent,
    JiraffeIndivLeaderboardComponent,
    JiraffeTeamLeaderboardComponent,
    HomePageComponent,
    EmployeeDashboardComponent,
    JiraffePersonalDataComponent,
    IndivMaturityComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule.forRoot([
      {path: '', component: HomePageComponent, canActivate: [AuthGuard] },
      {path: 'teams/:teamName', component: TeamsPopupComponent, canActivate: [AuthGuard] },
      {path: 'teampage/:teamName', component: TeamPageComponent, canActivate: [AuthGuard] },
      {path: 'employeedash/:employeeName', component: EmployeeDashboardComponent, canActivate: [AuthGuard] }
    ]),
    MaterialModule,
    MatProgressSpinnerModule
  ],
  entryComponents: [ LoginDialog ],
  providers: [ DataService, TeamsPopupDataService, TicketDataService, MaturitySelectionService,
                AuthGuard , TeamInfoService],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
