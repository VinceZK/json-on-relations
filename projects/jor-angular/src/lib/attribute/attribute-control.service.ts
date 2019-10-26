import { Injectable } from '@angular/core';
import {AttributeBase} from './attribute-base';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {DomainValueValidator} from './attribute-validators';
import {EntityService} from '../entity.service';
import {Attribute} from '../entity';

@Injectable({
  providedIn: 'root'
})
export class AttributeControlService {
  private specialInputCtrls: FormControl[] = [];

  constructor(private entityService: EntityService,
              private domainValueValidator: DomainValueValidator) {
  }

  toAttributeControl(attributes: Attribute[]): AttributeBase[] {
    const attributeControls: AttributeBase[] = [];
    if (!attributes) { return attributeControls; }
    attributes.forEach(attribute => {
      const attributeControl = new AttributeBase();
      attributeControl.key = attribute.ATTR_GUID;
      attributeControl.name = attribute.ATTR_NAME;
      attributeControl.label = attribute.LABEL_TEXT;
      attributeControl.list_label = attribute.LIST_HEADER_TEXT;
      attributeControl.relationId = attribute.RELATION_ID;
      attributeControl.searchHelpId = attribute.SEARCH_HELP_ID;
      attributeControl.searchHelpExportField = attribute.SEARCH_HELP_EXPORT_FIELD;
      attributeControl.domainId = attribute.DOMAIN_ID;
      attributeControl.domainEntityId = attribute.DOMAIN_ENTITY_ID;
      attributeControl.domainRelationId = attribute.DOMAIN_RELATION_ID;
      switch (attribute.DATA_TYPE) {
        case 1: // Char
          if (attribute.CAPITAL_ONLY) {
            attributeControl.controlType = 'text_capital';
            // onkeyup="this.value = this.value.toUpperCase();"
          } else {
            if (attribute.DOMAIN_TYPE === 3) {
              attributeControl.controlType = 'dropdown';
              this._generateDropdownList(attribute.DOMAIN_ID, attributeControl);
            } else {
              attributeControl.controlType = 'text';
              attributeControl.pattern = attribute.REG_EXPR;
            }
          }
          attributeControl.maxLength = attribute.DATA_LENGTH;
          attributeControl.primaryKey = attribute.PRIMARY_KEY;
          break;
        case 2: // Integer
          if (attribute.DOMAIN_TYPE === 3) {
            attributeControl.controlType = 'dropdown';
            this._generateDropdownList(attribute.DOMAIN_ID, attributeControl);
          } else {
            attributeControl.controlType = 'integer';
            if (attribute.UNSIGNED) {
              attributeControl.pattern = '^\\d+([^.,])?$';
            }
            attributeControl.autoIncrement = attribute.AUTO_INCREMENT;
          }
          attributeControl.primaryKey = attribute.PRIMARY_KEY;
          break;
        case 3: // Boolean
          attributeControl.controlType = 'checkbox';
          break;
        case 4: // Decimal
          attributeControl.controlType = 'decimal';
          this._setDecimalPattern(attributeControl, attribute);
          break;
        case 5: // String
          attributeControl.controlType = 'textarea';
          break;
        case 6: // Binary
          attributeControl.controlType = 'file';
          break;
        case 7: // Date
          attributeControl.controlType = 'date';
          break;
        case 8: // Timestamp
          attributeControl.controlType = 'timestamp';
          break;
        default:
          attributeControl.controlType = 'text';
      }
      attributeControls.push(attributeControl);
    });
    return attributeControls;
  }

  _generateDropdownList(domainID: string, attributeControl: AttributeBase) {
    this.entityService.getDataDomain(domainID)
      .subscribe( dataDomain =>
        dataDomain['DOMAIN_VALUES'].forEach( domainValue => {
          attributeControl.dropdownList.push({
            key: domainValue['LOW_VALUE'],
            value: domainValue['LOW_VALUE_TEXT'] || domainValue['LOW_VALUE'] });
        })
      );
  }

  _setDecimalPattern(attributeControl: AttributeBase, attribute: Attribute) {
    const zeroPadding = '0000000000000000000000000000000000000';
    attributeControl.step = '0.' + zeroPadding.substr(0, attribute.DECIMAL - 1 ) + '1';
    attributeControl.placeholder = '0.' + zeroPadding.substr(0, attribute.DECIMAL - 1 ) + '0';
    const integerPlace = attribute.DATA_LENGTH - attribute.DECIMAL;
    attributeControl.pattern = attribute.UNSIGNED ? '^(' : '^(\\-?';
    attributeControl.pattern += integerPlace ? '\\d{1,' + integerPlace.toString() + '})' : '0)';
    attributeControl.pattern += '(\\.\\d{1,' + attribute.DECIMAL + '})?$';
    attributeControl.maxLength = attribute.DATA_LENGTH;
  }

  convertToFormControl(attribute: Attribute, instance: any ) {
    const formControl = new FormControl(instance[attribute.ATTR_NAME] || '');
    if (attribute.PRIMARY_KEY && !attribute.AUTO_INCREMENT) {
      formControl.setValidators(Validators.required);
    }
    // if (attribute.DOMAIN_TYPE === 2 && !attribute.PRIMARY_KEY) {
    //   formControl.setAsyncValidators(this.domainValueValidator.validate.bind(this.domainValueValidator));
    // }
    if (attribute.DATA_TYPE === 3 || attribute.DOMAIN_TYPE === 3) { // Checkbox and dropdown list controls
      this.specialInputCtrls.push(formControl);
    }
    return formControl;
  }

  convertToFormGroup(attributes: Attribute[], instance: any, isDirty?: boolean) {
    const group = {};
    attributes.forEach(attribute => {
      group[attribute.ATTR_NAME] = this.convertToFormControl(attribute, instance);
      if (instance[attribute.ATTR_NAME] && isDirty) { group[attribute.ATTR_NAME].markAsDirty(); }
    });
    return new FormGroup(group);
  }

  switch2EditMode4SpecialCtrls() {
    this.specialInputCtrls.forEach( specialCtrl => specialCtrl.enable());
  }

  switch2DisplayMode4SpecialCtrls() {
    this.specialInputCtrls.forEach( specialCtrl => specialCtrl.disable());
  }
}
