import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataElementDetailComponent } from './data-element-detail.component';

describe('DataElementDetailComponent', () => {
  let component: DataElementDetailComponent;
  let fixture: ComponentFixture<DataElementDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataElementDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataElementDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
