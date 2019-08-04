import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JiraffeIndivLeaderboardComponent } from './jiraffe-indiv-leaderboard.component';

describe('JiraffeIndivLeaderboardComponent', () => {
  let component: JiraffeIndivLeaderboardComponent;
  let fixture: ComponentFixture<JiraffeIndivLeaderboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JiraffeIndivLeaderboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JiraffeIndivLeaderboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
