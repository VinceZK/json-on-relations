import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {Attribute} from 'jor-angular';
import {ModelService} from '../model.service';

@Component({
  selector: 'app-attribute-meta',
  templateUrl: './attribute-meta.component.html',
  styleUrls: ['./attribute-meta.component.css']
})
export class AttributeMetaComponent implements OnInit, OnChanges {
  dataTypes = [];
  formArray: FormArray;
  deletedAttributes = [];

  constructor(private fb: FormBuilder, private modelService: ModelService) {
    this.dataTypes = modelService.dataTypes;
  }

  @Input() parentForm: FormGroup;
  @Input() attributes: Attribute[];
  @Input() readonly: boolean;
  @Input() relationID: string;
  @Input() isNewMode: boolean;

  ngOnInit() {
  }

  ngOnChanges() {
    this.generateFormArray();
    this.formArray = this.parentForm.get('ATTRIBUTES') as FormArray;
  }

  deleteAttribute(index: number): void {
    if (index !== this.formArray.length - 1) {
      this.deletedAttributes.push(this.formArray.at(index).get('ATTR_GUID').value);
      this.formArray.removeAt(index);
      this.formArray.markAsDirty();
    }
  }

  onChangeDataType(attrFormGroup: AbstractControl): void {
    switch (attrFormGroup.get('DATA_TYPE').value) {
      case '1': // char
        attrFormGroup.get('DATA_LENGTH').setValue(10);
        attrFormGroup.get('DECIMAL').setValue(null);
        break;
      case '4': // decimal
        attrFormGroup.get('DATA_LENGTH').setValue(23);
        attrFormGroup.get('DECIMAL').setValue(2);
        break;
      default:
        attrFormGroup.get('DATA_LENGTH').setValue(null);
        attrFormGroup.get('DECIMAL').setValue(null);
    }
    attrFormGroup.get('DATA_LENGTH').markAsDirty();
  }

  onChangeAttributeName(index: number): void {
    if (index === this.formArray.length - 1 && !this.formArray.controls[index].value.ATTR_GUID) {
      // Only work for the last New line
      this.formArray.push(
        this.fb.group({
          ATTR_GUID: [''],
          RELATION_ID: [''],
          ATTR_NAME: [''],
          ATTR_DESC: [''],
          DATA_ELEMENT: [''],
          DATA_TYPE: [1],
          DATA_LENGTH: [10],
          DECIMAL: [null],
          PRIMARY_KEY: [false],
          AUTO_INCREMENT: [false]
        }));
    }
  }

  processChangedAttributes(): any[] {
    const changedAttributes = [];
    let changedAttribute;
    let order = 0;
    let lastOrder = 0;
    if (this.formArray.dirty) {
      this.formArray.controls.forEach((attribute, index) => {
        order = attribute.get('ORDER') ? attribute.get('ORDER').value : index;
        if (order < lastOrder) { order = lastOrder + 1; }
        lastOrder = order;
        if (attribute.get('ATTR_NAME').value.trim() === '') { return; }
        if (attribute.dirty) {
          changedAttribute = { ORDER: order };
          if (attribute.get('ATTR_GUID').value) { // Update Case
            changedAttribute['action'] = 'update';
            changedAttribute['ATTR_GUID'] = attribute.get('ATTR_GUID').value;
            const attrFormGroup = attribute as FormGroup;
            Object.keys(attrFormGroup.controls).forEach(key => {
              const formControl = attrFormGroup.controls[key];
              if (formControl.dirty) {
                changedAttribute[key] = formControl.value;
              }
            });
          } else { // New Add Case
            changedAttribute['action'] = 'add';
            const attrFormGroup = attribute as FormGroup;
            Object.keys(attrFormGroup.controls).forEach(key => {
              const formControl = attrFormGroup.controls[key];
              changedAttribute[key] = formControl.value;
            });
          }
        } else {
          changedAttribute = null;
        }
        if (changedAttribute) {
          changedAttributes.push(changedAttribute);
        }
      });

      // Deletion Case
      this.deletedAttributes.forEach(attributeGUID => {
        changedAttribute = {action: 'delete', ATTR_GUID: attributeGUID};
        changedAttributes.push(changedAttribute);
      });

      return changedAttributes;
    }
  }

  generateFormArray(): void {
    const formArray = [];
    if (this.attributes) {
      this.attributes.forEach( attribute => {
        formArray.push(this.fb.group({
          ATTR_GUID: [attribute.ATTR_GUID],
          RELATION_ID: [attribute.RELATION_ID],
          ATTR_NAME: [attribute.ATTR_NAME],
          ATTR_DESC: [attribute.ATTR_DESC],
          DATA_ELEMENT: [attribute.DATA_ELEMENT],
          DATA_TYPE: [{value: attribute.DATA_TYPE, disabled: this.readonly || this.isFieldGray(attribute)}],
          DATA_LENGTH: [attribute.DATA_LENGTH],
          DECIMAL: [attribute.DECIMAL],
          ORDER: [attribute.ORDER],
          PRIMARY_KEY: [{value: attribute.PRIMARY_KEY, disabled: this.readonly || this.isFieldGray(attribute)}],
          AUTO_INCREMENT: [{value: attribute.AUTO_INCREMENT, disabled: this.readonly || this.isFieldGray(attribute)}]
        }));
      });
    }
    if (this.isNewMode) {
      formArray.push(this.fb.group({
        ATTR_GUID: [''],
        RELATION_ID: [''],
        ATTR_NAME: [''],
        ATTR_DESC: [''],
        DATA_ELEMENT: [''],
        DATA_TYPE: [1],
        DATA_LENGTH: [10],
        DECIMAL: [null],
        PRIMARY_KEY: [false],
        AUTO_INCREMENT: [false]
      }));
    }
    this.parentForm.addControl('ATTRIBUTES', new FormArray(formArray));
  }

  switchEditDisplay(readonly: boolean) {
    if (!readonly) { // Edit Mode
      this.formArray.controls.forEach(attrFormGroup => {
        if (!this.isFieldGray(attrFormGroup.value)) {
          attrFormGroup.get('DATA_TYPE').enable();
          attrFormGroup.get('PRIMARY_KEY').enable();
          attrFormGroup.get('AUTO_INCREMENT').enable();
        }
      });
      this.formArray.push(this.fb.group({
        ATTR_GUID: [''],
        RELATION_ID: [this.relationID],
        ATTR_NAME: [''],
        ATTR_DESC: [''],
        DATA_ELEMENT: [''],
        DATA_TYPE: [1],
        DATA_LENGTH: [10],
        DECIMAL: [null],
        PRIMARY_KEY: [false],
        AUTO_INCREMENT: [false]
      }));
    } else { // Display Mode
      let lastIndex = this.formArray.length - 1;
      while (lastIndex >= 0 && this.formArray.controls[lastIndex].get('ATTR_NAME').value.trim() === '') {
        this.formArray.removeAt(lastIndex);
        lastIndex--;
      }
      this.formArray.controls.forEach(attrFormGroup => {
        attrFormGroup.get('DATA_TYPE').disable();
        attrFormGroup.get('PRIMARY_KEY').disable();
        attrFormGroup.get('AUTO_INCREMENT').disable();
      });
    }
  }

  isFieldGray(attribute: Attribute): boolean {
    return this.relationID.substr(0, 3) === 'rs_' &&
        attribute && attribute.ATTR_NAME &&
       (attribute.ATTR_NAME === 'VALID_FROM' ||
        attribute.ATTR_NAME === 'VALID_TO' ||
        attribute.ATTR_NAME.substr(-14, 14) === '_INSTANCE_GUID' ||
        attribute.ATTR_NAME.substr(-10, 10) === '_ENTITY_ID');
  }
}
