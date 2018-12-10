import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataElementComponent } from './data-element.component';

describe('DataElementComponent', () => {
  let component: DataElementComponent;
  let fixture: ComponentFixture<DataElementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataElementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
