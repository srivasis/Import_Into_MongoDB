import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TeamInfoService {
  employeeTeam: Map<string, string[]>;

  constructor() { }

  setTeamsForEmployees(et: Map<string, string[]>) {
    this.employeeTeam = et;
  }

  getTeamsForEmployee(employee: string) {
    return this.employeeTeam.get(employee);
  }
}
