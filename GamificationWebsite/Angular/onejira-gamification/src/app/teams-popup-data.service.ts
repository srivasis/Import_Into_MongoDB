import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TeamsPopupDataService {
  private teams: string[] = [];
  private memberName = '';
  constructor() { }

  setTeamsForMember(option) {
    this.teams = option;
  }
  setTeamMemberName(name) {
    this.memberName = name;
  }
  getTeamsForMember() {
    return this.teams;
  }
  getTeamMemberName() {
    return this.memberName;
  }

}
