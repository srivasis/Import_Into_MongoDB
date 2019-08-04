import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndivMaturityComponent } from './indiv-maturity.component';

describe('IndivMaturityComponent', () => {
  let component: IndivMaturityComponent;
  let fixture: ComponentFixture<IndivMaturityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndivMaturityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndivMaturityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
