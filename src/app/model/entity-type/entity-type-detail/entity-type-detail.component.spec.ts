import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityTypeDetailComponent } from './entity-type-detail.component';

describe('EntityTypeDetailComponent', () => {
  let component: EntityTypeDetailComponent;
  let fixture: ComponentFixture<EntityTypeDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntityTypeDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityTypeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
