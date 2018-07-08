import { TestBed, inject } from '@angular/core/testing';

import { DkRelationService } from './dk-relation.service';

describe('DkRelationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DkRelationService]
    });
  });

  it('should be created', inject([DkRelationService], (service: DkRelationService) => {
    expect(service).toBeTruthy();
  }));
});
