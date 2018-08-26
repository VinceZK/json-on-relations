import { Injectable } from '@angular/core';
import {AttributeBase} from './attribute-base';
import {Attribute} from '../entity';
import {AttributeText} from './attribute-text';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class AttributeControlService {

  constructor() { }

  toAttributeControl(attributes: Attribute[]): AttributeBase<any>[] {
    const attributeControls: AttributeBase<any>[] = [];
    if (!attributes) { return attributeControls; }
    attributes.forEach(attribute => {
      // TODO convert to different UI controls according to the meta. Like boolean->checkbox, email->email, password->password
      attributeControls.push(new AttributeText({
        key: attribute.ATTR_GUID,
        name: attribute.ATTR_NAME,
        label: attribute.ATTR_NAME,
        primaryKey: attribute.PRIMARY_KEY,
        unique: attribute.UNIQUE,
        autoIncrement: attribute.AUTO_INCREMENT
      }));
    });
    return attributeControls;
  }

  convertToFormControl(attribute: Attribute, instance: any ) {
    return attribute.NOT_NULL ? new FormControl(instance[attribute.ATTR_NAME] || '', Validators.required ) :
      new FormControl(instance[attribute.ATTR_NAME] || '');
  }

  convertToFormGroup(attributes: Attribute[], instance: any) {
    const group = {};
    attributes.forEach(attribute => {
      group[attribute.ATTR_NAME] = this.convertToFormControl(attribute, instance);
    });
    return new FormGroup(group);
  }
}
