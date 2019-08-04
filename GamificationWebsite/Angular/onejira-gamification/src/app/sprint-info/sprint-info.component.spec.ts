import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SprintInfoComponent } from './sprint-info.component';

describe('SprintInfoComponent', () => {
  let component: SprintInfoComponent;
  let fixture: ComponentFixture<SprintInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SprintInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SprintInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
