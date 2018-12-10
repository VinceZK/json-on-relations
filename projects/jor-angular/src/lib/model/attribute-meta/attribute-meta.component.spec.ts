import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributeMetaComponent } from './attribute-meta.component';

describe('AttributeMetaComponent', () => {
  let component: AttributeMetaComponent;
  let fixture: ComponentFixture<AttributeMetaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttributeMetaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributeMetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
