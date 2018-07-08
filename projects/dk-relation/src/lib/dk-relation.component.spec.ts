import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DkRelationComponent } from './dk-relation.component';

describe('DkRelationComponent', () => {
  let component: DkRelationComponent;
  let fixture: ComponentFixture<DkRelationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DkRelationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DkRelationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
