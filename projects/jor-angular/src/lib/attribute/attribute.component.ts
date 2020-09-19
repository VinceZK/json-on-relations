import {Component, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import {AttributeBase} from './attribute-base';
import {FormGroup} from '@angular/forms';
import {SearchHelpComponent} from '../search-help/search-help.component';

@Component({
  selector: 'dk-app-attribute',
  templateUrl: './attribute.component.html',
  styleUrls: ['./attribute.component.css']
})
export class AttributeComponent implements OnInit, OnChanges{
  @Input() attributeControl: AttributeBase;
  @Input() formGroup: FormGroup;
  @Input() readonly: boolean;
  @Input() isSmallSize: boolean;
  @Input() noErrorMsg: boolean;
  @ViewChild(SearchHelpComponent, {static: false})
  private searchHelpComponent !: SearchHelpComponent;

  constructor() { }

  ngOnInit() {
    const fieldCtrl = this.formGroup.get(this.attributeControl.name);
    switch (this.attributeControl.controlType) {
      case 'timestamp':
        if (!this.readonly && !fieldCtrl.value) {
          const currentTimestamp = new Date();
          fieldCtrl.setValue(
            currentTimestamp.getFullYear() + '-' + ('0' + (currentTimestamp.getMonth() + 1)).slice(-2) + '-'
            + ('0' + currentTimestamp.getDate()).slice(-2) + ' ' + ('0' + currentTimestamp.getHours()).slice(-2) +
            ':' + ('0' + currentTimestamp.getMinutes()).slice(-2) + ':' + ('0' + currentTimestamp.getSeconds()).slice(-2));
          fieldCtrl.markAsDirty();
        }
        break;
      case 'date':
        if (!this.readonly && !fieldCtrl.value) {
          const currentDate = new Date();
          fieldCtrl.setValue(
            currentDate.getFullYear() + '-' + ('0' + (currentDate.getMonth() + 1)).slice(-2) + '-'
            + ('0' + currentDate.getDate()).slice(-2));
          fieldCtrl.markAsDirty();
        }
        break;
      default:
    }
  }

  ngOnChanges(): void {
    if (this.attributeControl.controlType === 'dropdown' ||
      this.attributeControl.controlType === 'checkbox') {
      this.readonly ? this.formGroup.get(this.attributeControl.name).disable() :
        this.formGroup.get(this.attributeControl.name).enable();
    }
  }

  get invalid() { return this.formGroup.controls[this.attributeControl.name].invalid; }
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
    if (attributeControl.searchHelpId) {
      this.searchHelpComponent.openSearchHelpModalBySearchHelp(
        attributeControl.searchHelpId, attributeControl.searchHelpExportField, attributeControl.name,
        this.formGroup, this.readonly );
    } else {
      this.searchHelpComponent.openSearchHelpModalByEntity(
        attributeControl.domainEntityId, attributeControl.domainRelationId, this.formGroup, this.readonly,
        attributeControl.name, attributeControl.domainId);
    }
  }
}
