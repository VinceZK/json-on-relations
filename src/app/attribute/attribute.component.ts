import {Component, Input, OnInit} from '@angular/core';
import {AttributeBase} from './attribute-base';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'app-attribute',
  templateUrl: './attribute.component.html',
  styleUrls: ['./attribute.component.css']
})
export class AttributeComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  @Input() attributeControl: AttributeBase<any>;
  @Input() formGroup: FormGroup;
  @Input() readonly: boolean;
  get isValid() { return this.formGroup.controls[this.attributeControl.name].valid; }
  get isReadonly() { return this.readonly }
}
