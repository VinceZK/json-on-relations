import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {Attribute} from '../../entity';

@Component({
  selector: 'app-attribute-meta',
  templateUrl: './attribute-meta.component.html',
  styleUrls: ['./attribute-meta.component.css']
})
export class AttributeMetaComponent implements OnInit, OnChanges {
  dataTypes = [
    {key: 1, value: 'Char'},
    {key: 2, value: 'Integer'},
    {key: 3, value: 'Boolean'},
    {key: 4, value: 'Decimal'},
    {key: 5, value: 'String'},
    {key: 6, value: 'Binary'},
    {key: 7, value: 'Date'},
    {key: 8, value: 'Timestamp'}
  ];
  formArray: FormArray;
  deletedAttributes = [];

  constructor(private fb: FormBuilder) { }

  @Input() parentForm: FormGroup;
  @Input() attributes: Attribute[];
  @Input() readonly: boolean;
  @Input() relationID: string;
  @Input() isNewMode: boolean;

  ngOnInit() { }

  ngOnChanges() {
    this._generateFormArray();
    this.formArray = this.parentForm.get('ATTRIBUTES') as FormArray;
  }

  deleteAttribute(index: number): void {
    if (index !== this.formArray.length - 1) {
      this.formArray.removeAt(index);
      this.deletedAttributes.push(this.formArray.at(index).get('ATTR_GUID').value);
      this.formArray.markAsDirty();
    }
  }

  onChangeDataType(attrFormGroup: FormGroup): void {
    attrFormGroup.controls['DATA_LENGTH'].setValue(null);
    attrFormGroup.controls['DATA_LENGTH'].markAsDirty();
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
          DATA_LENGTH: [null],
          DECIMAL: [null],
          PRIMARY_KEY: [false],
          AUTO_INCREMENT: [false]
        }));
    }
  }

  processChangedAttributes(): any[] {
    const changedAttributes = [];
    let changedAttribute;
    if (this.formArray.dirty) {
      this.formArray.controls.forEach(attribute => {
        if (attribute.get('ATTR_NAME').value.trim() === '') { return; }
        if (attribute.dirty) {
          changedAttribute = {};
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

  _generateFormArray(): void {
    const formArray = [];
    if (this.attributes) {
      this.attributes.forEach( attribute => {
        formArray.push(this.fb.group({
          ATTR_GUID: [attribute.ATTR_GUID],
          RELATION_ID: [attribute.RELATION_ID],
          ATTR_NAME: [attribute.ATTR_NAME],
          ATTR_DESC: [attribute.ATTR_DESC],
          DATA_ELEMENT: [attribute.DATA_ELEMENT],
          DATA_TYPE: [{value: attribute.DATA_TYPE, disabled: this.readonly}],
          DATA_LENGTH: [attribute.DATA_LENGTH],
          DECIMAL: [attribute.DECIMAL],
          PRIMARY_KEY: [attribute.PRIMARY_KEY],
          AUTO_INCREMENT: [{value: attribute.AUTO_INCREMENT, disabled: this.readonly}]
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
        DATA_LENGTH: [null],
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
        attrFormGroup.get('DATA_TYPE').enable();
        attrFormGroup.get('PRIMARY_KEY').enable();
        attrFormGroup.get('AUTO_INCREMENT').enable();
      });
      this.formArray.push(this.fb.group({
        ATTR_GUID: [''],
        RELATION_ID: [this.relationID],
        ATTR_NAME: [''],
        ATTR_DESC: [''],
        DATA_ELEMENT: [''],
        DATA_TYPE: [1],
        DATA_LENGTH: [null],
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
}
