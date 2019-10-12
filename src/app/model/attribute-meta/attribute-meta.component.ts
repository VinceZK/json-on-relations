import {Component, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {Attribute} from 'jor-angular';
import {ModelService} from '../model.service';
import {Observable} from 'rxjs';
import {SearchHelpMethod, SearchHelp, EntityService, SearchHelpComponent} from 'jor-angular';

@Component({
  selector: 'app-attribute-meta',
  templateUrl: './attribute-meta.component.html',
  styleUrls: ['./attribute-meta.component.css']
})
export class AttributeMetaComponent implements OnInit, OnChanges {
  dataTypes = [];
  formArray: FormArray;
  deletedAttributes = [];

  constructor(private fb: FormBuilder,
              private entityService: EntityService,
              private modelService: ModelService) {
    this.dataTypes = modelService.dataTypes;
  }

  @Input() parentForm: FormGroup;
  @Input() attributes: Attribute[];
  @Input() readonly: boolean;
  @Input() relationID: string;
  @Input() isNewMode: boolean;

  @ViewChild(SearchHelpComponent, {static: false})
  private searchHelpComponent !: SearchHelpComponent;

  ngOnInit() {
  }

  ngOnChanges() {
    this.generateFormArray();
    this.formArray = this.parentForm.get('ATTRIBUTES') as FormArray;
  }

  onSearchHelp(control: AbstractControl, rowID: number): void {
    const searchHelpMeta = new SearchHelp();
    searchHelpMeta.OBJECT_NAME = 'Data Element';
    searchHelpMeta.METHOD = function(entityService: EntityService): SearchHelpMethod {
      return (searchTerm: string): Observable<object[]> => entityService.listDataElement(searchTerm);
    }(this.entityService);
    searchHelpMeta.BEHAVIOUR = 'M';
    searchHelpMeta.MULTI = false;
    searchHelpMeta.FUZZY_SEARCH = true;
    searchHelpMeta.FIELDS = [
      {FIELD_NAME: 'ELEMENT_ID', FIELD_DESC: 'Element ID', IE_FIELD_NAME: 'DATA_ELEMENT',
        IMPORT: true, EXPORT: true, LIST_POSITION: 1, FILTER_POSITION: 0},
      {FIELD_NAME: 'ELEMENT_DESC', FIELD_DESC: 'Element Description', IE_FIELD_NAME: 'ATTR_DESC',
        IMPORT: true, EXPORT: true, LIST_POSITION: 2, FILTER_POSITION: 0}
    ];
    searchHelpMeta.READ_ONLY = this.readonly || control.get('DATA_ELEMENT').disabled;

    const afterExportFn = function (context: any, attrIdx: number) {
      return () => context.onChangeDataElement(attrIdx);
    }(this, rowID).bind(this);
    this.searchHelpComponent.openSearchHelpModal(searchHelpMeta, control, afterExportFn);
  }

  deleteAttribute(index: number): void {
    if (index !== this.formArray.length - 1) {
      this.deletedAttributes.push(this.formArray.at(index).get('ATTR_GUID').value);
      this.formArray.removeAt(index);
      this.formArray.markAsDirty();
    }
  }

  insertAttribute(index: number): void {
    this.formArray.insert(index, this._createAnAttributeFormCtrl());
  }

  _createAnAttributeFormCtrl(): FormGroup {
    return this.fb.group({
      ATTR_GUID: [''],
      RELATION_ID: [''],
      ATTR_NAME: [''],
      ATTR_DESC: [{value: '', disabled: true}],
      DATA_ELEMENT: [{value: '', disabled: false}],
      DATA_TYPE: [{value: '', disabled: true}],
      DATA_LENGTH: [{value: '', disabled: true}],
      DECIMAL: [null],
      PRIMARY_KEY: [false],
      AUTO_INCREMENT: [{value: false, disabled: true}]
    });
  }

  switchBtwDEAndDT(index: number): void {
    const currentAttributeFormCtrl = this.formArray.at(index);
    const dataElementCtrl = currentAttributeFormCtrl.get('DATA_ELEMENT');
    if (dataElementCtrl.enabled) {
      this._disableField(dataElementCtrl);
      this._enableField(currentAttributeFormCtrl.get('ATTR_DESC'));
      this._enableField(currentAttributeFormCtrl.get('DATA_TYPE'));
      this._enableField(currentAttributeFormCtrl.get('DATA_LENGTH'));
      this._enableField(currentAttributeFormCtrl.get('DECIMAL'));
      currentAttributeFormCtrl.get('DATA_TYPE').setValue(1);
      currentAttributeFormCtrl.get('DATA_LENGTH').setValue(10);
      this._disableField(currentAttributeFormCtrl.get('AUTO_INCREMENT'));
    } else {
      dataElementCtrl.enable();
      this._enableField(dataElementCtrl);
      this._disableField(currentAttributeFormCtrl.get('ATTR_DESC'));
      this._disableField(currentAttributeFormCtrl.get('DATA_TYPE'));
      this._disableField(currentAttributeFormCtrl.get('DATA_LENGTH'));
      this._disableField(currentAttributeFormCtrl.get('DECIMAL'));
      this._disableField(currentAttributeFormCtrl.get('AUTO_INCREMENT'));
    }
  }

  _enableField(ctrl: AbstractControl) {
    ctrl.setValue(null);
    ctrl.enable();
  }

  _disableField(ctrl: AbstractControl) {
    if (ctrl.value !== null && ctrl.value !== '') {
      ctrl.setValue(null);
      ctrl.markAsDirty();
    }
    ctrl.disable();
  }

  onChangeDataType(attrFormGroup: AbstractControl): void {
    switch (attrFormGroup.get('DATA_TYPE').value) {
      case '1': // char
        attrFormGroup.get('DATA_LENGTH').setValue(10);
        attrFormGroup.get('DECIMAL').setValue(null);
        this._disableField(attrFormGroup.get('AUTO_INCREMENT'));
        break;
      case '2': // Integer
        attrFormGroup.get('DATA_LENGTH').setValue(null);
        attrFormGroup.get('DECIMAL').setValue(null);
        this._enableField(attrFormGroup.get('AUTO_INCREMENT'));
        break;
      case '4': // decimal
        attrFormGroup.get('DATA_LENGTH').setValue(23);
        attrFormGroup.get('DECIMAL').setValue(2);
        this._disableField(attrFormGroup.get('AUTO_INCREMENT'));
        break;
      default:
        attrFormGroup.get('DATA_LENGTH').setValue(null);
        attrFormGroup.get('DECIMAL').setValue(null);
        this._disableField(attrFormGroup.get('AUTO_INCREMENT'));
    }
    attrFormGroup.get('DATA_LENGTH').markAsDirty();
  }

  onChangeAttributeName(index: number): void {
    if (index === this.formArray.length - 1 && !this.formArray.controls[index].value.ATTR_GUID) {
      // Only work for the last New line
      this.formArray.push(this._createAnAttributeFormCtrl());
    }
  }

  onChangeDataElement(index: number): void {
    const attributeFormGroup = this.formArray.at(index);
    const dataElementCtrl = attributeFormGroup.get('DATA_ELEMENT');
    this.entityService.getDataElement(dataElementCtrl.value).subscribe(data => {
      if (data['msgCat']) {
        dataElementCtrl.setErrors({message: data['msgShortText']});
      } else {
        attributeFormGroup.get('ATTR_DESC').setValue(data['ELEMENT_DESC']);
        attributeFormGroup.get('DATA_TYPE').setValue(data['DATA_TYPE']);
        attributeFormGroup.get('DATA_LENGTH').setValue(data['DATA_LENGTH']);
        attributeFormGroup.get('DECIMAL').setValue(data['DECIMAL']);
        if (attributeFormGroup.get('DATA_TYPE').value === 2) {
          this._enableField(attributeFormGroup.get('AUTO_INCREMENT'));
        } else {
          this._disableField(attributeFormGroup.get('AUTO_INCREMENT'));
        }
      }
    });
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
        const isDataElementAttribute = !!attribute.DATA_ELEMENT;
        formArray.push(this.fb.group({
          ATTR_GUID: [attribute.ATTR_GUID],
          RELATION_ID: [attribute.RELATION_ID],
          ATTR_NAME: [attribute.ATTR_NAME],
          ATTR_DESC: [{value: attribute.ATTR_DESC, disabled: isDataElementAttribute}],
          DATA_ELEMENT: [{value: attribute.DATA_ELEMENT, disabled: !isDataElementAttribute}],
          DATA_TYPE: [{value: attribute.DATA_TYPE, disabled: this.readonly || this.isFieldGray(attribute) || isDataElementAttribute}],
          DATA_LENGTH: [{value: attribute.DATA_LENGTH, disabled: isDataElementAttribute}],
          DECIMAL: [{value: attribute.DECIMAL, disabled: isDataElementAttribute}],
          ORDER: [attribute.ORDER],
          PRIMARY_KEY: [{value: attribute.PRIMARY_KEY, disabled: this.readonly || this.isFieldGray(attribute)}],
          AUTO_INCREMENT: [{
            value: attribute.AUTO_INCREMENT,
            disabled: this.readonly || this.isFieldGray(attribute) || attribute.DATA_TYPE !== 2}]
        }));
      });
    }
    if (this.isNewMode) {
      formArray.push(this._createAnAttributeFormCtrl());
    }
    this.parentForm.addControl('ATTRIBUTES', new FormArray(formArray));
  }

  switchEditDisplay(readonly: boolean) {
    if (!readonly) { // Edit Mode
      this.formArray.controls.forEach(attrFormGroup => {
        if (!this.isFieldGray(attrFormGroup.value)) {
          attrFormGroup.get('DATA_TYPE').enable();
          attrFormGroup.get('PRIMARY_KEY').enable();
          if (attrFormGroup.get('DATA_TYPE').value === 2) {
            attrFormGroup.get('AUTO_INCREMENT').enable();
          } else {
            attrFormGroup.get('AUTO_INCREMENT').disable();
          }
        }
      });
      this.formArray.push(this._createAnAttributeFormCtrl());
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
