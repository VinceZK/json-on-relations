import {Component, Input, OnInit} from '@angular/core';
import {AttributeBase} from '../attribute-base';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'app-attribute-form',
  templateUrl: './attribute-form.component.html',
  styleUrls: ['./attribute-form.component.css']
})
export class AttributeFormComponent implements OnInit {

  constructor() { }

  @Input() attributeControl: AttributeBase;
  @Input() formGroup: FormGroup;
  @Input() readonly: boolean;
  ngOnInit() {

  }
}
