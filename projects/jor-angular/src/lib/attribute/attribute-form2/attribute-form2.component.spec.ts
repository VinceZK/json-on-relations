import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributeForm2Component } from './attribute-form2.component';

describe('AttributeForm2Component', () => {
  let component: AttributeForm2Component;
  let fixture: ComponentFixture<AttributeForm2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttributeForm2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributeForm2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
