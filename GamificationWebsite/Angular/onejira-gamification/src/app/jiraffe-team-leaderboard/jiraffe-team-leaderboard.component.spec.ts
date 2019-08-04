import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JiraffeTeamLeaderboardComponent } from './jiraffe-team-leaderboard.component';

describe('JiraffeTeamLeaderboardComponent', () => {
  let component: JiraffeTeamLeaderboardComponent;
  let fixture: ComponentFixture<JiraffeTeamLeaderboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JiraffeTeamLeaderboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JiraffeTeamLeaderboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
