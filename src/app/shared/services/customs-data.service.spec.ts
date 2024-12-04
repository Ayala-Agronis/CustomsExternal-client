import { TestBed } from '@angular/core/testing';

import { CustomsDataService } from './customs-data.service';

describe('CustomsDataService', () => {
  let service: CustomsDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomsDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
