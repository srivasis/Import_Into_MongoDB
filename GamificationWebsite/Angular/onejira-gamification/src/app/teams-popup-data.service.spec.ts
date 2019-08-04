import { TestBed } from '@angular/core/testing';

import { TeamsPopupDataService } from './teams-popup-data.service';

describe('TeamsPopupDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TeamsPopupDataService = TestBed.get(TeamsPopupDataService);
    expect(service).toBeTruthy();
  });
});
