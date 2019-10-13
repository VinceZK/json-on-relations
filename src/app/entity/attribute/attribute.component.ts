import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {AttributeBase} from './attribute-base';
import {FormGroup} from '@angular/forms';
import {SearchHelpComponent} from 'jor-angular';

@Component({
  selector: 'app-attribute',
  templateUrl: './attribute.component.html',
  styleUrls: ['./attribute.component.css']
})
export class AttributeComponent implements OnInit {
  @Input() attributeControl: AttributeBase;
  @Input() formGroup: FormGroup;
  @Input() readonly: boolean;
  @ViewChild(SearchHelpComponent, {static: false})
  private searchHelpComponent !: SearchHelpComponent;

  constructor() { }

  ngOnInit() {
  }

  get isValid() { return this.formGroup.controls[this.attributeControl.name].valid; }
  get errorMessage() {
    const fieldCtrl = this.formGroup.get(this.attributeControl.name);
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
  get isReadonly() { return this.readonly || this.attributeControl.autoIncrement; }

  onKeyup(attributeName: string) {
    const fieldCtrl = this.formGroup.get(attributeName);
    fieldCtrl.setValue(fieldCtrl.value.toUpperCase());
  }

  onSearchHelp(attributeControl: AttributeBase) {
    this.searchHelpComponent.openSearchHelpModalByEntity(
      attributeControl.domainEntityId, attributeControl.domainRelationId, this.formGroup, this.readonly,
      attributeControl.name, attributeControl.domainId);
  }
}
