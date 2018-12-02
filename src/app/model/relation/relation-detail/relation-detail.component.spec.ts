import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RelationDetailComponent } from './relation-detail.component';

describe('RelationDetailComponent', () => {
  let component: RelationDetailComponent;
  let fixture: ComponentFixture<RelationDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RelationDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RelationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
