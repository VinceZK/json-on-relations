import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DkEntityComponent } from './dk-entity.component';

describe('DkEntityComponent', () => {
  let component: DkEntityComponent;
  let fixture: ComponentFixture<DkEntityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DkEntityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DkEntityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
