import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JiraffePersonalDataComponent } from './jiraffe-personal-data.component';

describe('JiraffePersonalDataComponent', () => {
  let component: JiraffePersonalDataComponent;
  let fixture: ComponentFixture<JiraffePersonalDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JiraffePersonalDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JiraffePersonalDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
