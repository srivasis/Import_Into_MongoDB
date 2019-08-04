import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaturityGraphTableComponent } from './maturity-graph-table.component';

describe('MaturityGraphTableComponent', () => {
  let component: MaturityGraphTableComponent;
  let fixture: ComponentFixture<MaturityGraphTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaturityGraphTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaturityGraphTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
