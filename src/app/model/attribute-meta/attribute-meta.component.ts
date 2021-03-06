import {Component, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {Attribute} from 'jor-angular';
import {ModelService} from '../model.service';
import {Observable} from 'rxjs';
import {SearchHelpMethod, SearchHelp, EntityService, SearchHelpComponent} from 'jor-angular';
import {MessageService, Message} from 'ui-message-angular';
import {msgStore} from '../../msgStore';
import {Router} from '@angular/router';

@Component({
  selector: 'app-attribute-meta',
  templateUrl: './attribute-meta.component.html',
  styleUrls: ['./attribute-meta.component.css']
})
export class AttributeMetaComponent implements OnInit, OnChanges {
  dataTypes = [];
  formArray: FormArray;
  deletedAttributes = [];
  dataElementSearchHelp: SearchHelp;

  constructor(private fb: FormBuilder,
              private router: Router,
              private entityService: EntityService,
              private messageService: MessageService,
              private modelService: ModelService) {
    this.dataTypes = modelService.dataTypes;
    this.messageService.setMessageStore(msgStore, 'EN');
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
    if (!this.dataElementSearchHelp) {
      this.dataElementSearchHelp = new SearchHelp();
      this.dataElementSearchHelp.OBJECT_NAME = 'Data Element';
      this.dataElementSearchHelp.METHOD = function(entityService: EntityService): SearchHelpMethod {
        return (searchTerm: string): Observable<object[]> => entityService.listDataElement(searchTerm);
      }(this.entityService);
      this.dataElementSearchHelp.BEHAVIOUR = 'A';
      this.dataElementSearchHelp.MULTI = false;
      this.dataElementSearchHelp.FUZZY_SEARCH = true;
      this.dataElementSearchHelp.FIELDS = [
        {FIELD_NAME: 'ELEMENT_ID', LIST_HEADER_TEXT: 'Element ID', IE_FIELD_NAME: 'DATA_ELEMENT',
          IMPORT: true, EXPORT: true, LIST_POSITION: 1, FILTER_POSITION: 0},
        {FIELD_NAME: 'ELEMENT_DESC', LIST_HEADER_TEXT: 'Element Description', IE_FIELD_NAME: 'ATTR_DESC',
          IMPORT: true, EXPORT: true, LIST_POSITION: 2, FILTER_POSITION: 0}
      ];
      this.dataElementSearchHelp.READ_ONLY = this.readonly || control.get('DATA_ELEMENT').disabled;
    }
    const afterExportFn = function (context: any, attrIdx: number) {
      return () => context.onChangeDataElement(attrIdx);
    }(this, rowID).bind(this);
    this.searchHelpComponent.openSearchHelpModal(this.dataElementSearchHelp, control, afterExportFn);
  }

  deleteAttribute(index: number): void {
    if (index !== this.formArray.length - 1) {
      this.deletedAttributes.push({
        ATTR_GUID: this.formArray.at(index).get('ATTR_GUID').value,
        ATTR_NAME: this.formArray.at(index).get('ATTR_NAME').value
      });
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
      ORDER: [null],
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

  checkAttributes(): Message[] {
    const Messages: Message[] = [];
    if ( this.formArray.controls.findIndex( control => control.get('PRIMARY_KEY').value ) === -1 ) {
      Messages.push(this.messageService.generateMessage(
        'MODEL', 'RELATION_PRIMARY_KEY_MISSING', 'E'));
    }
    return Messages;
  }

  processChangedAttributes(): any[] {
    const changedAttributes = [];
    let changedAttribute;
    let order = 0;
    if (this.formArray.dirty) {
      this.formArray.controls.forEach((attribute, index) => {
        if (attribute.get('ATTR_NAME').value.trim() === '') { return; }
        order = index + 1;
        if (order !== attribute.get('ORDER').value) {
          attribute.get('ORDER').setValue(order);
          attribute.get('ORDER').markAsDirty();
        }
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
      this.deletedAttributes.forEach(attribute => {
        changedAttribute = {action: 'delete', ATTR_GUID: attribute.ATTR_GUID, ATTR_NAME: attribute.ATTR_NAME};
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
    if (!readonly) { // To Edit Mode
      this.formArray.controls.forEach(attrFormGroup => {
        if (!this.isFieldGray(attrFormGroup.value)) {
          if (!attrFormGroup.get('DATA_ELEMENT').value) {
            attrFormGroup.get('DATA_TYPE').enable();
          }
          attrFormGroup.get('PRIMARY_KEY').enable();
          if (attrFormGroup.get('DATA_TYPE').value === 2) {
            attrFormGroup.get('AUTO_INCREMENT').enable();
          } else {
            attrFormGroup.get('AUTO_INCREMENT').disable();
          }
        }
      });
      this.formArray.push(this._createAnAttributeFormCtrl());
    } else { // To Display Mode
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

  onGoToDataElement(dataElementName: string): void {
    this.router.navigate(['/model/data-element', dataElementName]);
  }
}
