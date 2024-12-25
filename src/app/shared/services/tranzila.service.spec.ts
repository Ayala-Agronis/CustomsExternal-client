import { TestBed } from '@angular/core/testing';

import { TranzilaService } from './tranzila.service';

describe('TranzilaService', () => {
  let service: TranzilaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TranzilaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
