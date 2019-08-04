import { TestBed } from '@angular/core/testing';

import { MaturitySelectionService } from './maturity-selection.service';

describe('MaturitySelectionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MaturitySelectionService = TestBed.get(MaturitySelectionService);
    expect(service).toBeTruthy();
  });
});
