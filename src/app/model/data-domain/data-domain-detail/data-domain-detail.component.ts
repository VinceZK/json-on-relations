import {Component, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, Form, FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {UniqueDataDomainValidator} from '../../model-validators';
import {Message, MessageService} from 'ui-message-angular';
import {ModelService} from '../../model.service';
import {DialogService} from '../../../dialog.service';
import {msgStore} from '../../../msgStore';
import {switchMap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {DataDomainMeta, SearchHelpComponent, EntityService} from 'jor-angular';

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
  bypassProtection = false;
  isSearchListShown = true;
  enableGeneralType = false;
  enableRegExpr = false;
  enableValueRelation = false;
  enableArrayOrInterval = false;

  @ViewChild(SearchHelpComponent)
  private searchHelpComponent: SearchHelpComponent;

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
          dataDomain.DOMAIN_TYPE = 4;
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
        this.dataDomainMeta = data;
        this._generateDataDomainForm();
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
      this._setNewModeState();
      this.dataDomainForm.get('DOMAIN_ID').setValue(this.dataDomainMeta.DOMAIN_ID);
      this.dataDomainForm.get('DOMAIN_DESC').setValue(this.dataDomainMeta.DOMAIN_DESC);
      this.dataDomainForm.get('DATA_TYPE').setValue(this.dataDomainMeta.DATA_TYPE);
      this.dataDomainForm.get('DATA_LENGTH').setValue(this.dataDomainMeta.DATA_LENGTH);
      this.dataDomainForm.get('DECIMAL').setValue(this.dataDomainMeta.DECIMAL);
      this.dataDomainForm.get('DOMAIN_TYPE').setValue(this.dataDomainMeta.DOMAIN_TYPE);
      this.dataDomainForm.get('UNSIGNED').setValue(this.dataDomainMeta.UNSIGNED);
      this.dataDomainForm.get('CAPITAL_ONLY').setValue(this.dataDomainMeta.CAPITAL_ONLY);
      this.dataDomainForm.get('REG_EXPR').setValue(this.dataDomainMeta.REG_EXPR);
      this.dataDomainForm.get('RELATION_ID').setValue(this.dataDomainMeta.RELATION_ID);
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
        DOMAIN_TYPE: [this.dataDomainMeta.DOMAIN_TYPE],
        UNSIGNED: [this.dataDomainMeta.UNSIGNED],
        CAPITAL_ONLY: [this.dataDomainMeta.CAPITAL_ONLY],
        REG_EXPR: [this.dataDomainMeta.REG_EXPR],
        RELATION_ID: [this.dataDomainMeta.RELATION_ID],
        DOMAIN_VALUES: this.fb.array([])
      });
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
      this._setNewModeState();
    }
    this.onChangeDomainType(this.dataDomainForm);
    this._updateLengthAndDecimal(this.dataDomainForm);
  }

  _setNewModeState() {
    if (this.isNewMode) {
      this.dataDomainForm.get('DOMAIN_ID').setValidators(this._validateDataDomainID);
      this.dataDomainForm.get('DOMAIN_ID').setAsyncValidators(
        this.uniqueDataDomainValidator.validate.bind(this.uniqueDataDomainValidator));
    } else {
      this.dataDomainForm.get('DOMAIN_ID').clearValidators();
      this.dataDomainForm.get('DOMAIN_ID').clearAsyncValidators();
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
  }

  _switch2EditMode(): void {
    this.readonly = false;
    this.dataDomainForm.get('DOMAIN_TYPE').enable();
    this.dataDomainForm.get('DATA_TYPE').enable();
    this._updateLengthAndDecimal(this.dataDomainForm);
  }

  onChangeDataDomainID(): void {
    this.modelService.updateDataDomainID(this.dataDomainForm.get('DOMAIN_ID').value);
  }

  onChangeDataDomainDesc(): void {
    this.modelService.updateDataDomainDesc(this.dataDomainForm.get('DOMAIN_DESC').value);
  }

  onChangeDomainType(formGroup: AbstractControl): void {
    switch (+formGroup.get('DOMAIN_TYPE').value) {
      case 0: // General Type
        if (+formGroup.get('DATA_TYPE').value === 2) {
          formGroup.get('UNSIGNED').enable();
          this._invalidField(formGroup.get('CAPITAL_ONLY'));
        } else if (+formGroup.get('DATA_TYPE').value === 1) {
          formGroup.get('CAPITAL_ONLY').enable();
          this._invalidField(formGroup.get('UNSIGNED'));
        }
        this._invalidField(formGroup.get('REG_EXPR'));
        this._invalidField(formGroup.get('RELATION_ID'));
        this._invalidField(formGroup.get('DOMAIN_VALUES'), true);
        break;
      case 1: // Regular Expression
        formGroup.get('REG_EXPR').enable();
        this._invalidField(formGroup.get('UNSIGNED'));
        this._invalidField(formGroup.get('CAPITAL_ONLY'));
        this._invalidField(formGroup.get('RELATION_ID'));
        this._invalidField(formGroup.get('DOMAIN_VALUES'), true);
        break;
      case 2: // Value Relation
        formGroup.get('RELATION_ID').enable();
        this._invalidField(formGroup.get('REG_EXPR'));
        this._invalidField(formGroup.get('UNSIGNED'));
        this._invalidField(formGroup.get('CAPITAL_ONLY'));
        this._invalidField(formGroup.get('DOMAIN_VALUES'), true);
        break;
      case 3: // Value Array
        formGroup.get('DOMAIN_VALUES').enable();
        this._invalidField(formGroup.get('RELATION_ID'));
        this._invalidField(formGroup.get('REG_EXPR'));
        this._invalidField(formGroup.get('UNSIGNED'));
        this._invalidField(formGroup.get('CAPITAL_ONLY'));
        this._generateEmptyLines(5);
        break;
      case 4: // Value Interval
        formGroup.get('DOMAIN_VALUES').enable();
        this._invalidField(formGroup.get('RELATION_ID'));
        this._invalidField(formGroup.get('REG_EXPR'));
        this._invalidField(formGroup.get('UNSIGNED'));
        this._invalidField(formGroup.get('CAPITAL_ONLY'));
        this._generateEmptyLines(5);
        break;
      default:
    }
  }

  _invalidField(fieldCtrl: AbstractControl, isArray: boolean = false): void {
    fieldCtrl.disable();
    // if (isArray) {
    //   (<FormArray>fieldCtrl).clear();
    // }
    fieldCtrl.setValue(null);
    fieldCtrl.markAsDirty();
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
    this._updateLengthAndDecimal(formGroup);
  }

  _updateLengthAndDecimal(formGroup: AbstractControl): void {
    switch (+formGroup.get('DATA_TYPE').value) {
      case 1: // char
        formGroup.get('DATA_LENGTH').enable();
        formGroup.get('DECIMAL').disable();
        if (+formGroup.get('DOMAIN_TYPE').value === 0) {
          formGroup.get('CAPITAL_ONLY').enable();
          formGroup.get('UNSIGNED').disable();
          formGroup.get('UNSIGNED').setValue(null);
          formGroup.get('UNSIGNED').markAsDirty();
        }
        this.enableGeneralType = true;
        this.enableRegExpr = true;
        this.enableValueRelation = true;
        this.enableArrayOrInterval = true;
        break;
      case 2: // Integer
        formGroup.get('DATA_LENGTH').disable();
        formGroup.get('DECIMAL').disable();
        if (+formGroup.get('DOMAIN_TYPE').value === 0) {
          formGroup.get('UNSIGNED').enable();
          formGroup.get('CAPITAL_ONLY').disable();
          formGroup.get('CAPITAL_ONLY').setValue(null);
          formGroup.get('CAPITAL_ONLY').markAsDirty();
        } else if (+formGroup.get('DOMAIN_TYPE').value === 1 || +formGroup.get('DOMAIN_TYPE').value === 2) {
          formGroup.get('DOMAIN_TYPE').setValue(0);
          this.onChangeDomainType(formGroup);
        }
        this.enableGeneralType = true;
        this.enableRegExpr = false;
        this.enableValueRelation = false;
        this.enableArrayOrInterval = true;
        break;
      case 4: // decimal
        formGroup.get('DATA_LENGTH').enable();
        formGroup.get('DECIMAL').enable();
        formGroup.get('CAPITAL_ONLY').disable();
        formGroup.get('CAPITAL_ONLY').setValue(null);
        formGroup.get('CAPITAL_ONLY').markAsDirty();
        formGroup.get('UNSIGNED').disable();
        formGroup.get('UNSIGNED').setValue(null);
        formGroup.get('UNSIGNED').markAsDirty();
        formGroup.get('DOMAIN_TYPE').setValue(0);
        this.onChangeDomainType(formGroup);
        this.enableGeneralType = true;
        this.enableRegExpr = false;
        this.enableValueRelation = false;
        this.enableArrayOrInterval = false;
        break;
      case 5: // string
        formGroup.get('DATA_LENGTH').disable();
        formGroup.get('DECIMAL').disable();
        formGroup.get('DOMAIN_TYPE').setValue(1);
        this.onChangeDomainType(formGroup);
        this.enableGeneralType = false;
        this.enableRegExpr = true;
        this.enableValueRelation = false;
        this.enableArrayOrInterval = false;
        break;
      default:
        formGroup.get('DATA_LENGTH').disable();
        formGroup.get('DECIMAL').disable();
        formGroup.get('CAPITAL_ONLY').disable();
        formGroup.get('CAPITAL_ONLY').setValue(null);
        formGroup.get('CAPITAL_ONLY').markAsDirty();
        formGroup.get('UNSIGNED').disable();
        formGroup.get('UNSIGNED').setValue(null);
        formGroup.get('UNSIGNED').markAsDirty();
        formGroup.get('DOMAIN_TYPE').setValue(0);
        this.onChangeDomainType(formGroup);
        this.enableGeneralType = true;
        this.enableRegExpr = false;
        this.enableValueRelation = false;
        this.enableArrayOrInterval = false;
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
    if (this.dataDomainForm.get('RELATION_ID').dirty) {
      this.changedDataDomain['RELATION_ID'] = this.dataDomainForm.get('RELATION_ID').value;
    }
    if (this.dataDomainForm.get('DOMAIN_VALUES').dirty) {
      this.changedDataDomain['DOMAIN_VALUES'] = this.dataDomainForm.get('DOMAIN_VALUES').value;
    }
    console.log(this.changedDataDomain);
    // this.entityService.saveDataDomain(this.changedDataDomain)
    //   .subscribe(data => this._postActivityAfterSavingDataDomain(data));
  }

  _postActivityAfterSavingDataDomain(data: any) {
    if (data['ELEMENT_ID']) {
      if (this.isNewMode) {
        this.isNewMode = false;
        this.bypassProtection = true;
        this.router.navigate(['/model/data-domain/' + data['DOMAIN_ID']]);
      } else {
        this._switch2DisplayMode();
        this.dataDomainMeta = data;
        this.changedDataDomain = {};
        this._generateDataDomainForm();
        this.messageService.reportMessage('MODEL', 'DATA_DOMAIN_SAVED', 'S', this.dataDomainMeta.DOMAIN_ID);
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

