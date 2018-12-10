import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataDomainComponent } from './data-domain.component';

describe('DataDomainComponent', () => {
  let component: DataDomainComponent;
  let fixture: ComponentFixture<DataDomainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataDomainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataDomainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
