import { TestBed } from '@angular/core/testing';

import { CustomsBookApiService } from './customs-book-api.service';

describe('CustomsBookApiService', () => {
  let service: CustomsBookApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomsBookApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
