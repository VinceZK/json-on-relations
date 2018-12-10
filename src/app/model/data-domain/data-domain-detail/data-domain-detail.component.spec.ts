import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataDomainDetailComponent } from './data-domain-detail.component';

describe('DataDomainDetailComponent', () => {
  let component: DataDomainDetailComponent;
  let fixture: ComponentFixture<DataDomainDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataDomainDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataDomainDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
