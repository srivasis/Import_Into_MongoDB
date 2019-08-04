import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndivVelocityComponent } from './indiv-velocity.component';

describe('IndivVelocityComponent', () => {
  let component: IndivVelocityComponent;
  let fixture: ComponentFixture<IndivVelocityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndivVelocityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndivVelocityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
