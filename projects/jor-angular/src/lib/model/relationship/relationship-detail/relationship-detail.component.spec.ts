import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RelationshipDetailComponent } from './relationship-detail.component';

describe('RelationshipDetailComponent', () => {
  let component: RelationshipDetailComponent;
  let fixture: ComponentFixture<RelationshipDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RelationshipDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RelationshipDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
