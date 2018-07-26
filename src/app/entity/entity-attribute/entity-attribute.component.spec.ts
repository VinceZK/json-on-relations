import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityAttributeComponent } from './entity-attribute.component';

describe('EntityAttributeComponent', () => {
  let component: EntityAttributeComponent;
  let fixture: ComponentFixture<EntityAttributeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntityAttributeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityAttributeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
