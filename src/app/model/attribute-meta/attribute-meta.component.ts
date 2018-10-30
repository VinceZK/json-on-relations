import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-attribute-meta',
  templateUrl: './attribute-meta.component.html',
  styleUrls: ['./attribute-meta.component.css']
})
export class AttributeMetaComponent implements OnInit, OnChanges {
  dataTypes = [
    {key: 1, value: 'Char'},
    {key: 2, value: 'Integer'},
    {key: 3, value: 'Double'},
    {key: 4, value: 'Float'},
    {key: 5, value: 'String'},
    {key: 6, value: 'XString'},
    {key: 7, value: 'Binary'},
    {key: 8, value: 'Date'},
    {key: 9, value: 'Timestamp'},
    {key: 10, value: 'Boolean'},
    {key: 11, value: 'MultiValue'}
  ];
  formArray: FormArray;

  constructor(private fb: FormBuilder) { }

  @Input() parentForm: FormGroup;
  @Input() readonly: boolean;
  ngOnInit() { }

  ngOnChanges() {
    this.formArray = this.parentForm.get('ATTRIBUTES') as FormArray;
  }

  deleteAttribute(index: number): void {
    if (index !== this.formArray.length - 1) {
      this.formArray.removeAt(index);
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
          RELATION_ID: [this.parentForm.get('ENTITY_ID').value],
          ATTR_NAME: [''],
          ATTR_DESC: [''],
          DATA_ELEMENT: [''],
          DATA_TYPE: [1],
          DATA_LENGTH: [null],
          PRIMARY_KEY: [false],
          SEARCHABLE: [false],
          NOT_NULL: [false],
          UNIQUE: [false],
          AUTO_INCREMENT: [false],
          IS_MULTI_VALUE: [false]
        }));
    }
  }
}
