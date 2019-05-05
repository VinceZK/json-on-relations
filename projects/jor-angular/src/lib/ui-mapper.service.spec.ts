import { TestBed } from '@angular/core/testing';

import { UiMapperService } from './ui-mapper.service';

describe('UiMapperService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UiMapperService = TestBed.get(UiMapperService);
    expect(service).toBeTruthy();
  });
});
