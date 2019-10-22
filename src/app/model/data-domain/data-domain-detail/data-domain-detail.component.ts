import {Component, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {UniqueDataDomainValidator} from '../../model-validators';
import {Message, MessageService} from 'ui-message-angular';
import {ModelService} from '../../model.service';
import {DialogService} from '../../../dialog.service';
import {msgStore} from '../../../msgStore';
import {switchMap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {DataDomainMeta, SearchHelpComponent, EntityService, SearchHelp, SearchHelpMethod} from 'jor-angular';

@Component({
  selector: 'app-data-domain-detail',
  templateUrl: './data-domain-detail.component.html',
  styleUrls: ['./data-domain-detail.component.css']
})
export class DataDomainDetailComponent implements OnInit {

  dataDomainMeta: DataDomainMeta;
  readonly = true;
  isNewMode = false;
  dataDomainForm: FormGroup;
  dataTypes = [];
  changedDataDomain = {};
  relationsOfEntity = [];
  bypassProtection = false;
  isSearchListShown = true;
  enableGeneralType = false;
  enableRegExpr = false;
  enableValueRelation = false;
  enableArrayOrInterval = false;

  @ViewChild(SearchHelpComponent, {static: false})
  private searchHelpComponent !: SearchHelpComponent;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private fb: FormBuilder,
              private uniqueDataDomainValidator: UniqueDataDomainValidator,
              private messageService: MessageService,
              private modelService: ModelService,
              private dialogService: DialogService,
              private entityService: EntityService) {
    this.messageService.setMessageStore(msgStore, 'EN');
    this.dataTypes = this.modelService.dataTypes;
  }

  get domainValueFormArray() {
    return this.dataDomainForm.get('DOMAIN_VALUES') as FormArray;
  }

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        const domainID = params.get('domainID');
        if (domainID === 'new') {
          const dataDomain = new DataDomainMeta();
          dataDomain.DOMAIN_ID = '';
          dataDomain.DOMAIN_DESC = '';
          dataDomain.DATA_TYPE = 1; // Char by default
          dataDomain.DATA_LENGTH = 10;
          dataDomain.DOMAIN_TYPE = 0;
          this.isNewMode = true;
          this.readonly = false;
          this.bypassProtection = false;
          return of(dataDomain);
        } else {
          this.readonly = true;
          this.isNewMode = false;
          return this.entityService.getDataDomain(domainID);
        }
      })
    ).subscribe(data => {
      if ( 'msgName' in data) {
        this.messageService.clearMessages();
        this.dataDomainMeta = null;
        this.dataDomainForm = null;
        this.messageService.report(<Message>data);
      } else {
        this.messageService.clearMessages();
        if (history.state.message) {
          this.messageService.report(history.state.message);
        }
        this.dataDomainMeta = <DataDomainMeta>data;
        this._generateDataDomainForm();
        this._getRelationsOfEntity( this.dataDomainForm, false);
      }
    });

    this.modelService.isSearchListShown$.subscribe( data => this.isSearchListShown = data);
  }

  showSearchList(): void {
    this.isSearchListShown = true;
    this.modelService.showSearchList();
  }

  _generateDataDomainForm(): void {
    if (this.dataDomainForm) {
      this.dataDomainForm.markAsPristine({onlySelf: false});
      this.dataDomainForm.get('DOMAIN_ID').setValue(this.dataDomainMeta.DOMAIN_ID);
      this.dataDomainForm.get('DOMAIN_DESC').setValue(this.dataDomainMeta.DOMAIN_DESC);
      this.dataDomainForm.get('DATA_TYPE').setValue(this.dataDomainMeta.DATA_TYPE);
      this.dataDomainForm.get('DATA_LENGTH').setValue(this.dataDomainMeta.DATA_LENGTH);
      this.dataDomainForm.get('DECIMAL').setValue(this.dataDomainMeta.DECIMAL);
      this.dataDomainForm.get('DOMAIN_TYPE').setValue(this.dataDomainMeta.DOMAIN_TYPE);
      this.dataDomainForm.get('UNSIGNED').setValue(this.dataDomainMeta.UNSIGNED);
      this.dataDomainForm.get('CAPITAL_ONLY').setValue(this.dataDomainMeta.CAPITAL_ONLY);
      this.dataDomainForm.get('REG_EXPR').setValue(this.dataDomainMeta.REG_EXPR);
      this.dataDomainForm.get('ENTITY_ID').setValue(this.dataDomainMeta.ENTITY_ID);
      this.dataDomainForm.get('RELATION_ID').setValue(this.dataDomainMeta.RELATION_ID);
      (<FormArray>this.dataDomainForm.get('DOMAIN_VALUES')).clear();
      if (this.readonly) {
        this.dataDomainForm.get('DOMAIN_TYPE').disable();
        this.dataDomainForm.get('DATA_TYPE').disable();
      }
    } else {
      this.dataDomainForm = this.fb.group({
        DOMAIN_ID: [this.dataDomainMeta.DOMAIN_ID, {updateOn: 'blur'}],
        DOMAIN_DESC: [this.dataDomainMeta.DOMAIN_DESC],
        DATA_TYPE: [{value: this.dataDomainMeta.DATA_TYPE, disabled: this.readonly}],
        DATA_LENGTH: [this.dataDomainMeta.DATA_LENGTH, [this._validateDataLength]],
        DECIMAL: [this.dataDomainMeta.DECIMAL, [this._validateDecimal]],
        DOMAIN_TYPE: [{value: this.dataDomainMeta.DOMAIN_TYPE, disabled: this.readonly}],
        UNSIGNED: [{value: this.dataDomainMeta.UNSIGNED, disabled: this.readonly}],
        CAPITAL_ONLY: [{value: this.dataDomainMeta.CAPITAL_ONLY, disabled: this.readonly}],
        REG_EXPR: [this.dataDomainMeta.REG_EXPR],
        ENTITY_ID: [this.dataDomainMeta.ENTITY_ID],
        RELATION_ID: [{value: this.dataDomainMeta.RELATION_ID, disabled: this.readonly}],
        DOMAIN_VALUES: this.fb.array([])
      });
    }
    this._setNewModeState();
    if (this.dataDomainMeta.DOMAIN_TYPE >= 3 && this.dataDomainMeta.DOMAIN_VALUES) { // Value Array/Interval
      this.dataDomainMeta.DOMAIN_VALUES.forEach( domainValue => {
        this.domainValueFormArray.push(
          this.fb.group({
            LOW_VALUE: [domainValue.LOW_VALUE],
            LOW_VALUE_TEXT: [domainValue.LOW_VALUE_TEXT],
            HIGH_VALUE: [domainValue.HIGH_VALUE]
          })
        );
      });
    }
    this._setDomainType(this.dataDomainForm, false);
    this._updateLengthAndDecimal(this.dataDomainForm, false);
  }

  _setNewModeState() {
    if (this.isNewMode) {
      this.dataDomainForm.get('DOMAIN_ID').setValidators(this._validateDataDomainID);
      this.dataDomainForm.get('DOMAIN_ID').setAsyncValidators(
        this.uniqueDataDomainValidator.validate.bind(this.uniqueDataDomainValidator));
      this.dataDomainForm.get('DATA_TYPE').enable();
      this.dataDomainForm.get('DOMAIN_TYPE').enable();
      this.dataDomainForm.get('DATA_TYPE').markAsDirty(); // Default value mark as dirty
      this.dataDomainForm.get('DATA_LENGTH').markAsDirty(); // Default value mark as dirty
      this.dataDomainForm.get('DOMAIN_TYPE').markAsDirty(); // Default value mark as dirty
    } else {
      this.dataDomainForm.get('DOMAIN_ID').clearValidators();
      this.dataDomainForm.get('DOMAIN_ID').clearAsyncValidators();
      this.dataDomainForm.get('DOMAIN_ID').updateValueAndValidity();
    }
  }

  _validateDataDomainID(c: FormControl) {
    if (c.value.trim() === '') {
      return {message: 'Data Domain ID is mandatory'};
    }

    if (c.value.toString().toLowerCase() === 'new') {
      return {message: '"NEW/new" is reserved, thus is not allowed to use!'};
    }

    if (c.value.toString().length > 32) {
      return {message: 'Data Domain ID must have length less than 32!'};
    }
    return null;
  }

  _validateDataLength(c: FormControl) {
    if (c.enabled && !c.value) {
      return {message: 'Please give a Length'};
    }
    return null;
  }

  _validateDecimal(c: FormControl) {
    if (c.enabled && !c.value) {
      return {message: 'Please give a decimal place'};
    }
    if (c.value < 1 || c.value > 37) {
      return {message: 'Decimal place can only between 1 and 37'};
    }
    return null;
  }
  _validateEntityID(c: FormControl) {
    if (c.enabled && !c.value) {
      return {message: 'Please give an entity'};
    }
    return null;
  }
  _validateRelationID(c: FormControl) {
    if (c.enabled && !c.value) {
      return {message: 'Please give a relation'};
    }
    return null;
  }

  switchEditDisplay() {
    if (this.isNewMode) {
      this.dialogService.confirm('Discard the new Data Domain?').subscribe(confirm => {
        if (confirm) {
          this._switch2DisplayMode();
          this.dataDomainMeta = null;
          this.modelService.sendDialogAnswer('OK');
        } else {
          this.modelService.sendDialogAnswer('CANCEL');
        }
      });
      return;
    }

    if (!this.readonly) { // In Change Mode -> Display Mode
      if (this.dataDomainForm.dirty) {
        this.dialogService.confirm('Discard changes?').subscribe(confirm => {
          if (confirm) { // Discard changes and switch to Display Mode
            this._generateDataDomainForm();
            this.dataDomainForm.reset(this.dataDomainForm.value);
            this._switch2DisplayMode();
          }
        });
      } else { // Switch to display mode
        this._switch2DisplayMode();
      }
    } else { // In Display Mode -> Change Mode
      this._switch2EditMode();
    }

    this.messageService.clearMessages();
  }

  _switch2DisplayMode(): void {
    this.readonly = true;
    this.dataDomainForm.get('DOMAIN_TYPE').disable();
    this.dataDomainForm.get('DATA_TYPE').disable();
    this.dataDomainForm.get('UNSIGNED').disable();
    this.dataDomainForm.get('CAPITAL_ONLY').disable();
    this.dataDomainForm.get('RELATION_ID').disable();
  }

  _switch2EditMode(): void {
    this.readonly = false;
    this.dataDomainForm.get('DOMAIN_TYPE').enable();
    this.dataDomainForm.get('DATA_TYPE').enable();
    this._setDomainType(this.dataDomainForm, false);
    this._updateLengthAndDecimal(this.dataDomainForm, false);
  }

  onChangeDataDomainID(): void {
    this.modelService.updateDataDomainID(this.dataDomainForm.get('DOMAIN_ID').value);
  }

  onChangeDataDomainDesc(): void {
    this.modelService.updateDataDomainDesc(this.dataDomainForm.get('DOMAIN_DESC').value);
  }

  onChangeDomainType(formGroup: AbstractControl): void {
    this._setDomainType(formGroup, true);
  }

  onEntitySearchHelp(control: AbstractControl): void {
    const searchHelpMeta = new SearchHelp();
    searchHelpMeta.OBJECT_NAME = 'Entity ID';
    searchHelpMeta.METHOD = function(entityService: EntityService): SearchHelpMethod {
      return (searchTerm: string): Observable<object[]> => entityService.listEntityType(searchTerm);
    }(this.entityService);
    searchHelpMeta.BEHAVIOUR = 'M';
    searchHelpMeta.MULTI = false;
    searchHelpMeta.FUZZY_SEARCH = true;
    searchHelpMeta.FIELDS = [
      {FIELD_NAME: 'ENTITY_ID', FIELD_DESC: 'Entity', IMPORT: true, EXPORT: true, LIST_POSITION: 1, FILTER_POSITION: 0},
      {FIELD_NAME: 'ENTITY_DESC', FIELD_DESC: 'Description', IMPORT: true, EXPORT: true, LIST_POSITION: 2, FILTER_POSITION: 0}
    ];
    searchHelpMeta.READ_ONLY = this.readonly || this.dataDomainForm.get('DOMAIN_TYPE').value !== 2;
    const afterExportFn = function (context: any) {
      return () => context.onChangeEntityID(control);
    }(this).bind(this);
    this.searchHelpComponent.openSearchHelpModal(searchHelpMeta, control, afterExportFn);
  }

  onChangeEntityID(formGroup: AbstractControl): void {
    this._getRelationsOfEntity(formGroup, true);
  }

  _getRelationsOfEntity(dataDomainForm: AbstractControl, setDefault: boolean): void {
    const domainEntityID = dataDomainForm.get('ENTITY_ID').value;
    if (!domainEntityID) { return; }
    this.entityService.getRelationMetaOfEntity(domainEntityID)
      .subscribe(entityRelations => {
        this.relationsOfEntity = entityRelations.map(relationMeta => relationMeta.RELATION_ID )
          .filter(relationId => relationId.substr(0, 2) !== 'rs' );
        if (setDefault) {
          dataDomainForm.get('RELATION_ID').setValue(this.relationsOfEntity[0]);
          dataDomainForm.get('RELATION_ID').markAsDirty();
        }
      });
  }

  _setDomainType(formGroup: AbstractControl, markAsDirty: boolean): void {
    if (markAsDirty) { formGroup.get('DOMAIN_TYPE').markAsDirty(); }
    switch (+formGroup.get('DOMAIN_TYPE').value) {
      case 0: // General Type
        if (+formGroup.get('DATA_TYPE').value === 2) {
          if (!this.readonly) { formGroup.get('UNSIGNED').enable(); }
          this._invalidField(formGroup.get('CAPITAL_ONLY'), markAsDirty);
        } else if (+formGroup.get('DATA_TYPE').value === 1) {
          if (!this.readonly) { formGroup.get('CAPITAL_ONLY').enable(); }
          this._invalidField(formGroup.get('UNSIGNED'), markAsDirty);
        }
        this._invalidField(formGroup.get('REG_EXPR'), markAsDirty);
        this._invalidField(formGroup.get('ENTITY_ID'), markAsDirty);
        this._invalidField(formGroup.get('RELATION_ID'), markAsDirty);
        this._invalidField(formGroup.get('DOMAIN_VALUES'), markAsDirty, true);
        break;
      case 1: // Regular Expression
        // formGroup.get('REG_EXPR').setValidators(this._validateRegExpr);
        if (!this.readonly) { formGroup.get('REG_EXPR').enable(); }
        this._invalidField(formGroup.get('UNSIGNED'), markAsDirty);
        this._invalidField(formGroup.get('CAPITAL_ONLY'), markAsDirty);
        this._invalidField(formGroup.get('ENTITY_ID'), markAsDirty);
        this._invalidField(formGroup.get('RELATION_ID'), markAsDirty);
        this._invalidField(formGroup.get('DOMAIN_VALUES'), markAsDirty, true);
        break;
      case 2: // Value Relation
        formGroup.get('ENTITY_ID').setValidators(this._validateEntityID);
        formGroup.get('RELATION_ID').setValidators(this._validateRelationID);
        if (!this.readonly) {
          formGroup.get('ENTITY_ID').enable();
          formGroup.get('RELATION_ID').enable();
        }
        this._invalidField(formGroup.get('REG_EXPR'), markAsDirty);
        this._invalidField(formGroup.get('UNSIGNED'), markAsDirty);
        this._invalidField(formGroup.get('CAPITAL_ONLY'), markAsDirty);
        this._invalidField(formGroup.get('DOMAIN_VALUES'), markAsDirty, true);
        break;
      case 3: // Value Array
        if (!this.readonly) { formGroup.get('DOMAIN_VALUES').enable(); }
        this._invalidField(formGroup.get('ENTITY_ID'), markAsDirty);
        this._invalidField(formGroup.get('RELATION_ID'), markAsDirty);
        this._invalidField(formGroup.get('REG_EXPR'), markAsDirty);
        this._invalidField(formGroup.get('UNSIGNED'), markAsDirty);
        this._invalidField(formGroup.get('CAPITAL_ONLY'), markAsDirty);
        this._generateEmptyLines(5);
        break;
      case 4: // Value Interval
        if (!this.readonly) { formGroup.get('DOMAIN_VALUES').enable(); }
        this._invalidField(formGroup.get('ENTITY_ID'), markAsDirty);
        this._invalidField(formGroup.get('RELATION_ID'), markAsDirty);
        this._invalidField(formGroup.get('REG_EXPR'), markAsDirty);
        this._invalidField(formGroup.get('UNSIGNED'), markAsDirty);
        this._invalidField(formGroup.get('CAPITAL_ONLY'), markAsDirty);
        this._generateEmptyLines(5);
        break;
      default:
    }
  }

  _generateEmptyLines(num: number): void {
    const existingLines = this.domainValueFormArray.length;
    for (let i = 0; i < num - existingLines; i++) {
      this.domainValueFormArray.push(
        this.fb.group({
          LOW_VALUE: [''],
          LOW_VALUE_TEXT: [''],
          HIGH_VALUE: ['']
        }));
    }
  }

  onChangeDataType(formGroup: AbstractControl): void {
    switch (+formGroup.get('DATA_TYPE').value) {
      case 1: // char
        formGroup.get('DATA_LENGTH').setValue(10);
        formGroup.get('DECIMAL').setValue(null);
        break;
      case 4: // decimal
        formGroup.get('DATA_LENGTH').setValue(23);
        formGroup.get('DECIMAL').setValue(2);
        break;
      default:
        formGroup.get('DATA_LENGTH').setValue(null);
        formGroup.get('DECIMAL').setValue(null);
    }
    formGroup.get('DATA_LENGTH').markAsDirty();
    formGroup.get('DECIMAL').markAsDirty();
    this._updateLengthAndDecimal(formGroup, true);
  }

  _updateLengthAndDecimal(formGroup: AbstractControl, markAsDirty: boolean): void {
    switch (+formGroup.get('DATA_TYPE').value) {
      case 1: // char
        if (!this.readonly) { formGroup.get('DATA_LENGTH').enable(); }
        this._invalidField(formGroup.get('DECIMAL'));
        if (+formGroup.get('DOMAIN_TYPE').value === 0) {
          if (!this.readonly) { formGroup.get('CAPITAL_ONLY').enable(); }
          this._invalidField(formGroup.get('UNSIGNED'));
        }
        this.enableGeneralType = true;
        this.enableRegExpr = true;
        this.enableValueRelation = true;
        this.enableArrayOrInterval = true;
        break;
      case 2: // Integer
        formGroup.get('DATA_LENGTH').disable();
        this._invalidField(formGroup.get('DECIMAL'), markAsDirty);
        if (+formGroup.get('DOMAIN_TYPE').value === 0) {
          if (!this.readonly) { formGroup.get('UNSIGNED').enable(); }
          this._invalidField(formGroup.get('CAPITAL_ONLY'), markAsDirty);
        } else if (+formGroup.get('DOMAIN_TYPE').value === 1 || +formGroup.get('DOMAIN_TYPE').value === 2) {
          if (!this.readonly) { formGroup.get('DOMAIN_TYPE').setValue(0); }
          this._setDomainType(formGroup, markAsDirty);
        }
        this.enableGeneralType = true;
        this.enableRegExpr = false;
        this.enableValueRelation = false;
        this.enableArrayOrInterval = true;
        break;
      case 4: // decimal
        if (!this.readonly) { formGroup.get('DATA_LENGTH').enable(); }
        if (!this.readonly) { formGroup.get('DECIMAL').enable(); }
        this._invalidField(formGroup.get('CAPITAL_ONLY'), markAsDirty);
        this._invalidField(formGroup.get('UNSIGNED'), markAsDirty);
        formGroup.get('DOMAIN_TYPE').setValue(0);
        this._setDomainType(formGroup, markAsDirty);
        this.enableGeneralType = true;
        this.enableRegExpr = false;
        this.enableValueRelation = false;
        this.enableArrayOrInterval = false;
        break;
      case 5: // string
        this._invalidField(formGroup.get('DATA_LENGTH'), markAsDirty);
        this._invalidField(formGroup.get('DECIMAL'), markAsDirty);
        formGroup.get('DOMAIN_TYPE').setValue(1);
        this._setDomainType(formGroup, markAsDirty);
        this.enableGeneralType = false;
        this.enableRegExpr = true;
        this.enableValueRelation = false;
        this.enableArrayOrInterval = false;
        break;
      default:
        this._invalidField(formGroup.get('DATA_LENGTH'), markAsDirty);
        this._invalidField(formGroup.get('DECIMAL'), markAsDirty);
        this._invalidField(formGroup.get('CAPITAL_ONLY'), markAsDirty);
        this._invalidField(formGroup.get('UNSIGNED'), markAsDirty);
        formGroup.get('DOMAIN_TYPE').setValue(0);
        this._setDomainType(formGroup, markAsDirty);
        this.enableGeneralType = true;
        this.enableRegExpr = false;
        this.enableValueRelation = false;
        this.enableArrayOrInterval = false;
    }
  }

  _invalidField(fieldCtrl: AbstractControl, markAsDirty: boolean = false, isArray: boolean = false): void {
    fieldCtrl.clearValidators();
    fieldCtrl.clearAsyncValidators();
    fieldCtrl.disable();
    if (markAsDirty) {
      isArray ? (<FormArray>fieldCtrl).clear() : fieldCtrl.setValue(null);
      fieldCtrl.markAsDirty();
    }
  }

  onChangeDomainValue(index: number): void {
    const currentDomainValueCtrl = this.domainValueFormArray.at(index);
    if (!currentDomainValueCtrl.get('LOW_VALUE').value) { return; }
    const indexFound = this.domainValueFormArray.controls.findIndex(
      (ctrl, valueIndex) => index !== valueIndex && ctrl.value.LOW_VALUE === currentDomainValueCtrl.value.LOW_VALUE);
    if (indexFound > -1) {
      currentDomainValueCtrl.get('LOW_VALUE').setErrors({message: 'Value is duplicated!'});
    } else {
      currentDomainValueCtrl.get('LOW_VALUE').setErrors(null);
    }

    if (this.dataDomainForm.get('DOMAIN_TYPE').value === 4 && currentDomainValueCtrl.get('LOW_VALUE').value) {
      if (!currentDomainValueCtrl.value.HIGH_VALUE ||
        currentDomainValueCtrl.value.HIGH_VALUE <=  currentDomainValueCtrl.value.LOW_VALUE ) {
        currentDomainValueCtrl.get('HIGH_VALUE').setErrors({message: 'High value must be greater!'});
      } else {
        currentDomainValueCtrl.get('HIGH_VALUE').setErrors(null);
      }
    }
  }

  insertDomainValue(index: number): void {
    this.domainValueFormArray.insert(index, this.fb.group({
        LOW_VALUE: [''],
        LOW_VALUE_TEXT: [''],
        HIGH_VALUE: ['']
      }));
  }

  deleteDomainValue(index: number): void {
    this.domainValueFormArray.removeAt(index);
    this.domainValueFormArray.markAsDirty();
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.isNewMode || (!this.bypassProtection && this.dataDomainForm && this.dataDomainForm.dirty)) {
      const dialogAnswer = this.dialogService.confirm('Discard changes?');
      dialogAnswer.subscribe(confirm => {
        if (confirm) {
          this.modelService.sendDialogAnswer('OK');
        } else {
          this.modelService.sendDialogAnswer('CANCEL');
        }
      });
      return dialogAnswer;
    } else {
      return true;
    }
  }

  save(): void {
    if (!this.dataDomainForm.dirty) {
      return this.messageService.reportMessage('MODEL', 'NO_CHANGE', 'S');
    }

    if (this.dataDomainForm.invalid) {
      return this.messageService.reportMessage('MODEL', 'INVALID_DATA', 'E');
    }

    if (this.isNewMode) {
      this.changedDataDomain['action'] = 'add';
      this.changedDataDomain['DOMAIN_ID'] = this.dataDomainForm.get('DOMAIN_ID').value;
    } else {
      this.changedDataDomain['action'] = 'update';
      this.changedDataDomain['DOMAIN_ID'] = this.dataDomainMeta.DOMAIN_ID;
    }
    if (this.dataDomainForm.get('DOMAIN_DESC').dirty) {
      this.changedDataDomain['DOMAIN_DESC'] = this.dataDomainForm.get('DOMAIN_DESC').value;
    }
    if (this.dataDomainForm.get('DATA_TYPE').dirty) {
      this.changedDataDomain['DATA_TYPE'] = this.dataDomainForm.get('DATA_TYPE').value;
    }
    if (this.dataDomainForm.get('DATA_LENGTH').dirty) {
      this.changedDataDomain['DATA_LENGTH'] = this.dataDomainForm.get('DATA_LENGTH').value;
    }
    if (this.dataDomainForm.get('DECIMAL').dirty) {
      this.changedDataDomain['DECIMAL'] = this.dataDomainForm.get('DECIMAL').value;
    }
    if (this.dataDomainForm.get('DOMAIN_TYPE').dirty) {
      this.changedDataDomain['DOMAIN_TYPE'] = this.dataDomainForm.get('DOMAIN_TYPE').value;
    }
    if (this.dataDomainForm.get('UNSIGNED').dirty) {
      this.changedDataDomain['UNSIGNED'] = this.dataDomainForm.get('UNSIGNED').value;
    }
    if (this.dataDomainForm.get('CAPITAL_ONLY').dirty) {
      this.changedDataDomain['CAPITAL_ONLY'] = this.dataDomainForm.get('CAPITAL_ONLY').value;
    }
    if (this.dataDomainForm.get('REG_EXPR').dirty) {
      this.changedDataDomain['REG_EXPR'] = this.dataDomainForm.get('REG_EXPR').value;
    }
    if (this.dataDomainForm.get('ENTITY_ID').dirty) {
      this.changedDataDomain['ENTITY_ID'] = this.dataDomainForm.get('ENTITY_ID').value;
    }
    if (this.dataDomainForm.get('RELATION_ID').dirty) {
      this.changedDataDomain['RELATION_ID'] = this.dataDomainForm.get('RELATION_ID').value;
    }
    if (this.dataDomainForm.get('DOMAIN_VALUES').dirty) {
      this.changedDataDomain['DOMAIN_VALUES'] = [];
      this.dataDomainForm.get('DOMAIN_VALUES').value.forEach( domainValue => {
        if (domainValue.LOW_VALUE) {
          this.changedDataDomain['DOMAIN_VALUES'].push(domainValue);
        }
      });
    }
    this.entityService.saveDataDomain(this.changedDataDomain)
      .subscribe(data => this._postActivityAfterSavingDataDomain(data));
  }

  _postActivityAfterSavingDataDomain(data: any) {
    this.changedDataDomain = {};
    if (data['DOMAIN_ID']) {
      if (this.isNewMode) {
        this.isNewMode = false;
        this.bypassProtection = true;
        this.router.navigate(['/model/data-domain/' + data['DOMAIN_ID']],
          {state: {message: this.messageService.generateMessage(
                'MODEL', 'DATA_DOMAIN_SAVED', 'S', data['DOMAIN_ID'])}});
      } else {
        this._switch2DisplayMode();
        this.dataDomainMeta = data;
        this._generateDataDomainForm();
        this.messageService.reportMessage('MODEL', 'DATA_DOMAIN_SAVED', 'S', data['DOMAIN_ID']);
      }
    } else {
      if (data instanceof Array) {
        data.forEach(err => this.messageService.add(err));
      } else {
        this.messageService.report(<Message>data);
      }
    }
  }
}


