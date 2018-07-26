import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityRelationshipComponent } from './entity-relationship.component';

describe('EntityRelationshipComponent', () => {
  let component: EntityRelationshipComponent;
  let fixture: ComponentFixture<EntityRelationshipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntityRelationshipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityRelationshipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
