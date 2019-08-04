import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamsPopupComponent } from './teams-popup.component';

describe('TeamsPopupComponent', () => {
  let component: TeamsPopupComponent;
  let fixture: ComponentFixture<TeamsPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamsPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
