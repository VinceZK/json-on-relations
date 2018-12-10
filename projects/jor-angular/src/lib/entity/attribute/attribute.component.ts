import {Component, Input, OnInit} from '@angular/core';
import {AttributeBase} from './attribute-base';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'dk-attribute',
  templateUrl: './attribute.component.html',
  styleUrls: ['./attribute.component.css']
})
export class AttributeComponent implements OnInit {
  @Input() attributeControl: AttributeBase<any>;
  @Input() formGroup: FormGroup;
  @Input() readonly: boolean;

  constructor() { }

  ngOnInit() {
  }

  get isValid() { return this.formGroup.controls[this.attributeControl.name].valid; }
  get isReadonly() { return this.readonly || this.attributeControl.autoIncrement; }
}
