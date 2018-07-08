import { TestBed, inject } from '@angular/core/testing';

import { DkEntityService } from './dk-entity.service';

describe('DkEntityService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DkEntityService]
    });
  });

  it('should be created', inject([DkEntityService], (service: DkEntityService) => {
    expect(service).toBeTruthy();
  }));
});
