import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { DataService } from '../data.service';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import { TeamsPopupComponent } from '../teams-popup/teams-popup.component';
import { TeamsPopupDataService } from '../teams-popup-data.service';
import { Router } from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material/icon';
import { TeamInfoService } from '../team-info.service';

@Component({
  selector: 'app-search-team',
  templateUrl: './search-team.component.html',
  styleUrls: ['./search-team.component.css']
})
export class SearchTeamComponent implements OnInit {

  teamList: any = [];
  myControl = new FormControl();
  options: string[] = [];
  filteredOptions: Observable<string[]>;
  teamMemberList: any = [];
  teamMembers: string[] = [];
  memberMap = new Map();

  constructor(private dataService: DataService, private bottomSheet: MatBottomSheet,
              private popupService: TeamsPopupDataService, private router: Router,
              iconRegistry: MatIconRegistry, sanitizer: DomSanitizer, private setEmployeeService: TeamInfoService ) {
    iconRegistry.addSvgIcon('search', sanitizer.bypassSecurityTrustResourceUrl('assets/images/round-search-24px.svg'));
  }

  ngOnInit() {
    this.dataService.getTeamList().subscribe((list) => {
      this.teamList = list;
      for (const team of this.teamList) {
        const teamName: string = team[1] + '-' + team[0];
        this.options.push(teamName);
      }
    });
    this.dataService.getTeamsAndMembers().subscribe((res) => {
      this.teamMemberList = res;
      for (const team of this.teamMemberList) {
        for (const member of team.TeamMemberList) {
          let teamsForMember: string[] = [];
          if (this.memberMap.has(member)) {
            teamsForMember = this.memberMap.get(member);
            this.memberMap.delete(member);
          }
          teamsForMember.push(team._id);
          this.memberMap.set(member, teamsForMember);
        }
      }
      // Set Map Service for future use
      this.setEmployeeService.setTeamsForEmployees(this.memberMap);
      for (const key of this.memberMap.keys()) {
        this.teamMembers.push(key);
        this.options.push(key);
      }
    });

    this.filteredOptions = this.myControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  openTeamListForMember(option): void {

    if (this.memberMap.has(option)) {
      const teams = this.memberMap.get(option);
      this.popupService.setTeamsForMember(teams);
      this.popupService.setTeamMemberName(option);
      this.bottomSheet.open(TeamsPopupComponent);
    } else {
      this.router.navigate(['/teampage', option.split('-')[1]]);
    }
  }
}

