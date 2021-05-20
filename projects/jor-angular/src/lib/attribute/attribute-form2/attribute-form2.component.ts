import {Component, Input, OnInit} from '@angular/core';
import {AttributeBase} from '../attribute-base';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'dk-app-attribute-form2',
  templateUrl: './attribute-form2.component.html',
  styleUrls: ['./attribute-form2.component.css']
})
export class AttributeForm2Component implements OnInit {

  constructor() { }

  @Input() attributeControl: AttributeBase;
  @Input() formGroup: FormGroup;
  @Input() readonly: boolean;
  @Input() isSmallSize: boolean;
  ngOnInit() {

  }

  get invalid() { return this.formGroup.controls[this.attributeControl.name]?.invalid; }

  get errorMessage() {
    const fieldCtrl = this.formGroup.get(this.attributeControl.name);
    if (!fieldCtrl) { return null; }
    if (fieldCtrl.getError('pattern')) {
      return 'The pattern is not correct';
    } else if (fieldCtrl.getError('required')) {
      return 'Required';
    } else if (fieldCtrl.getError('message')) {
      return fieldCtrl.getError('message');
    } else {
      return null;
    }
  }
}
