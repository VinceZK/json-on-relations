import {Component, Input, OnChanges, OnInit, Output, ViewChild} from '@angular/core';
import {AttributeBase} from './attribute-base';
import {FormGroup} from '@angular/forms';
import {SearchHelpComponent} from '../search-help/search-help.component';
import { v4 as uuid } from 'uuid';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'dk-app-attribute',
  templateUrl: './attribute.component.html',
  styleUrls: ['./attribute.component.css']
})
export class AttributeComponent implements OnInit, OnChanges {
  @Input() attributeControl: AttributeBase;
  @Input() formGroup: FormGroup;
  @Input() readonly: boolean;
  @Input() isSmallSize: boolean;
  @Input() noErrorMsg: boolean;
  @Output() change = new EventEmitter<any>();
  @ViewChild(SearchHelpComponent, {static: false})
  private searchHelpComponent !: SearchHelpComponent;
  localDatetime: Date;

  constructor() { }

  ngOnInit() {
    const fieldCtrl = this.formGroup.get(this.attributeControl.name);
    if (!fieldCtrl) { return; }
    switch (this.attributeControl.controlType) {
      case 'timestamp':
        if (!this.readonly && !fieldCtrl.value) {
          this.localDatetime = new Date();
          fieldCtrl.setValue(this.localDatetime.toISOString().slice(0, 19).replace('T', ' '));
          fieldCtrl.markAsDirty();
        } else if (fieldCtrl.value) {
          // to support Safari and Firefox, the dateStr format 'yyyy-MM-dd HH:mm:ss' needs to be converted to 'yyyy/MM/dd HH:mm:ss'
          this.localDatetime = new Date(fieldCtrl.value.replace(/-/g, '/') + ' UTC');
        }
        fieldCtrl.valueChanges.subscribe( value => {
          if (!value) { return; }
          this.localDatetime = new Date(value.replace(/-/g, '/') + ' UTC');
        });
        break;
      case 'date':
        if (!this.readonly && !fieldCtrl.value) {
          this.localDatetime = new Date();
          fieldCtrl.setValue(this.localDatetime.toISOString().slice(0, 10));
          fieldCtrl.markAsDirty();
        }
        break;
      default:
    }
    if (this.attributeControl.domainId === 'UUID' && !this.readonly && !fieldCtrl.value) {
      fieldCtrl.setValue(uuid());
      fieldCtrl.markAsDirty();
    }
    if (this.attributeControl.domainId === 'GUID' && !this.readonly && !fieldCtrl.value) {
      let guid = uuid();
      guid = guid.replace(/-/g, '').toUpperCase();
      fieldCtrl.setValue(guid);
      fieldCtrl.markAsDirty();
    }
  }

  ngOnChanges(): void {
    if (this.attributeControl.controlType === 'dropdown' ||
      this.attributeControl.controlType === 'checkbox') {
      this.readonly ? this.formGroup.get(this.attributeControl.name).disable() :
        this.formGroup.get(this.attributeControl.name).enable();
    }
  }

  onDateChange(newDate: Date): void {
    const UTCDateStr = newDate.toISOString().slice(0, 19).replace('T', ' ');
    const fieldCtrl = this.formGroup.get(this.attributeControl.name);
    if (fieldCtrl) {
      fieldCtrl.setValue(UTCDateStr);
      fieldCtrl.markAsDirty();
    }
  }

  get invalid() {
    return this.formGroup.controls[this.attributeControl.name]?.invalid;
  }
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

  onChange(event) {
    this.change.emit(event);
  }
}
