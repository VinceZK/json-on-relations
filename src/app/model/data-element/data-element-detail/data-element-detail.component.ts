import {Component, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {UniqueDataElementValidator} from '../../model-validators';
import {Message, MessageService} from 'ui-message-angular';
import {ModelService} from '../../model.service';
import {DialogService} from '../../../dialog.service';
import {msgStore} from '../../../msgStore';
import {switchMap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {DataElementMeta, EntityService, SearchHelp, SearchHelpComponent, SearchHelpField, SearchHelpMethod} from 'jor-angular';

@Component({
  selector: 'app-data-element-detail',
  templateUrl: './data-element-detail.component.html',
  styleUrls: ['./data-element-detail.component.css']
})
export class DataElementDetailComponent implements OnInit {
  dataElementMeta: DataElementMeta;
  readonly = true;
  isNewMode = false;
  dataElementForm: FormGroup;
  dataTypes = [];
  changedDataElement = {};
  bypassProtection = false;
  isSearchListShown = true;
  searchHelpExportField = [];

  @ViewChild(SearchHelpComponent, {static: false})
  private searchHelpComponent !: SearchHelpComponent;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private fb: FormBuilder,
              private uniqueDataElementValidator: UniqueDataElementValidator,
              private messageService: MessageService,
              private modelService: ModelService,
              private dialogService: DialogService,
              private entityService: EntityService) {
    this.messageService.setMessageStore(msgStore, 'EN');
    this.dataTypes = this.modelService.dataTypes;
  }

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        const elementID = params.get('elementID');
        if (elementID === 'new') {
          const dataElement = new DataElementMeta();
          dataElement.ELEMENT_ID = '';
          dataElement.ELEMENT_DESC = '';
          dataElement.DATA_TYPE = 1;
          dataElement.DATA_LENGTH = 10;
          this.isNewMode = true;
          this.readonly = false;
          this.bypassProtection = false;
          return of(dataElement);
        } else {
          this.readonly = true;
          this.isNewMode = false;
          return this.entityService.getDataElement(elementID);
        }})
    ).subscribe(data => {
      if ( 'msgName' in data) {
        this.messageService.clearMessages();
        this.dataElementMeta = null;
        this.dataElementForm = null;
        this.messageService.report(<Message>data);
      } else {
        this.messageService.clearMessages();
        if (history.state.message) {
          this.messageService.report(history.state.message);
        }
        this.dataElementMeta = <DataElementMeta>data;
        this._generateDataElementForm();
        this._getSearchHelpMeta(this.dataElementForm, false);
      }
    });

    this.modelService.isSearchListShown$.subscribe( data => this.isSearchListShown = data);
  }

  showSearchList(): void {
    this.isSearchListShown = true;
    this.modelService.showSearchList();
  }

  onDataDomainSearchHelp(control: AbstractControl): void {
    const searchHelpMeta = new SearchHelp();
    searchHelpMeta.OBJECT_NAME = 'Data Domain';
    searchHelpMeta.METHOD = function(entityService: EntityService): SearchHelpMethod {
      return (searchTerm: string): Observable<object[]> => entityService.listDataDomain(searchTerm);
    }(this.entityService);
    searchHelpMeta.BEHAVIOUR = 'A';
    searchHelpMeta.MULTI = false;
    searchHelpMeta.FUZZY_SEARCH = true;
    searchHelpMeta.FIELDS = [
      {FIELD_NAME: 'DOMAIN_ID', LIST_HEADER_TEXT: 'Domain', IMPORT: true, EXPORT: true, LIST_POSITION: 1, FILTER_POSITION: 0},
      {FIELD_NAME: 'DOMAIN_DESC', LIST_HEADER_TEXT: 'Description', IMPORT: true, EXPORT: true, LIST_POSITION: 2, FILTER_POSITION: 0}
    ];
    searchHelpMeta.READ_ONLY = this.readonly || !this.dataElementForm.get('USE_DOMAIN').value;
    const afterExportFn = function (context: any) {
      return () => context.onChangeDataDomain(control);
    }(this).bind(this);
    this.searchHelpComponent.openSearchHelpModal(searchHelpMeta, control, afterExportFn);
  }

  onSearchHelpSearchHelp(control: AbstractControl): void {
    const searchHelpMeta = new SearchHelp();
    searchHelpMeta.OBJECT_NAME = 'Search Help';
    searchHelpMeta.METHOD = function(entityService: EntityService): SearchHelpMethod {
      return (searchTerm: string): Observable<object[]> => entityService.listSearchHelp(searchTerm);
    }(this.entityService);
    searchHelpMeta.BEHAVIOUR = 'M';
    searchHelpMeta.MULTI = false;
    searchHelpMeta.FUZZY_SEARCH = true;
    searchHelpMeta.FIELDS = [
      {FIELD_NAME: 'SEARCH_HELP_ID', LIST_HEADER_TEXT: 'Search Help', IMPORT: true, EXPORT: true, LIST_POSITION: 1, FILTER_POSITION: 0},
      {FIELD_NAME: 'SEARCH_HELP_DESC', LIST_HEADER_TEXT: 'Description', IMPORT: true, EXPORT: true, LIST_POSITION: 2, FILTER_POSITION: 0}
    ];
    searchHelpMeta.READ_ONLY = this.readonly;
    const afterExportFn = function (context: any) {
      return () => context.onChangeSearchHelp(control);
    }(this).bind(this);
    this.searchHelpComponent.openSearchHelpModal(searchHelpMeta, control, afterExportFn);
  }

  onChangeSearchHelp(formGroup: AbstractControl): void {
    this._getSearchHelpMeta(formGroup, true);
  }

  _getSearchHelpMeta(formGroup: AbstractControl, setDefault: boolean): void {
    const searchHelpCtrl = formGroup.get('SEARCH_HELP_ID');
    if (!searchHelpCtrl.value) { return; }
    this.entityService.getSearchHelp(searchHelpCtrl.value).subscribe(data => {
      if (data['msgCat']) {
        searchHelpCtrl.setErrors({message: data['msgShortText']});
      } else {
        this.searchHelpExportField = [];
        const searchHelpFields = <SearchHelpField[]>data['FIELDS'];
        searchHelpFields.forEach( field => {
          if (field.EXPORT) {
            this.searchHelpExportField.push( field.IE_FIELD_NAME || field.FIELD_NAME );
          }
        });
        if (setDefault) {
          formGroup.get('SEARCH_HELP_EXPORT_FIELD').setValue(this.searchHelpExportField[0]);
          formGroup.get('SEARCH_HELP_EXPORT_FIELD').markAsDirty();
        }
      }
    });
  }

  _generateDataElementForm(): void {
    if (this.dataElementForm) {
      this.dataElementForm.markAsPristine({onlySelf: false});
      this.dataElementForm.get('ELEMENT_ID').setValue(this.dataElementMeta.ELEMENT_ID);
      this.dataElementForm.get('ELEMENT_DESC').setValue(this.dataElementMeta.ELEMENT_DESC);
      this.dataElementForm.get('LABEL_TEXT').setValue(this.dataElementMeta.LABEL_TEXT);
      this.dataElementForm.get('LIST_HEADER_TEXT').setValue(this.dataElementMeta.LIST_HEADER_TEXT);
      this.dataElementForm.get('DOMAIN_ID').setValue(this.dataElementMeta.DOMAIN_ID);
      this.dataElementForm.get('DATA_TYPE').setValue(this.dataElementMeta.DATA_TYPE);
      this.dataElementForm.get('DATA_LENGTH').setValue(this.dataElementMeta.DATA_LENGTH);
      this.dataElementForm.get('DECIMAL').setValue(this.dataElementMeta.DECIMAL);
      this.dataElementForm.get('SEARCH_HELP_ID').setValue(this.dataElementMeta.SEARCH_HELP_ID);
      this.dataElementForm.get('SEARCH_HELP_EXPORT_FIELD').setValue(this.dataElementMeta.SEARCH_HELP_EXPORT_FIELD);
      this.dataElementForm.get('PARAMETER_ID').setValue(this.dataElementMeta.PARAMETER_ID);
      if (this.dataElementMeta.DOMAIN_ID) {
        this.dataElementForm.get('USE_DOMAIN').setValue(1);
        this.dataElementForm.get('DATA_TYPE').disable();
      } else {
        this.dataElementForm.get('USE_DOMAIN').setValue(0);
        this.dataElementForm.get('DATA_TYPE').enable();
      }
      if (this.readonly) {
        this.dataElementForm.get('USE_DOMAIN').disable();
        this.dataElementForm.get('DOMAIN_ID').disable();
        this.dataElementForm.get('DATA_TYPE').disable();
        this.dataElementForm.get('SEARCH_HELP_EXPORT_FIELD').disable();
      }
    } else {
      this.dataElementForm = this.fb.group({
        ELEMENT_ID: [this.dataElementMeta.ELEMENT_ID, {updateOn: 'blur'}],
        ELEMENT_DESC: [this.dataElementMeta.ELEMENT_DESC],
        LABEL_TEXT: [this.dataElementMeta.LABEL_TEXT],
        LIST_HEADER_TEXT: [this.dataElementMeta.LIST_HEADER_TEXT],
        DOMAIN_ID: [this.dataElementMeta.DOMAIN_ID],
        DATA_TYPE: [{value: this.dataElementMeta.DATA_TYPE, disabled: this.readonly}],
        DATA_LENGTH: [this.dataElementMeta.DATA_LENGTH, [this._validateDataLength]],
        DECIMAL: [this.dataElementMeta.DECIMAL, [this._validateDecimal]],
        SEARCH_HELP_ID: [this.dataElementMeta.SEARCH_HELP_ID],
        SEARCH_HELP_EXPORT_FIELD: [{value: this.dataElementMeta.SEARCH_HELP_EXPORT_FIELD, disabled: this.readonly}],
        PARAMETER_ID: [this.dataElementMeta.PARAMETER_ID],
        USE_DOMAIN: [{value: this.dataElementMeta.DOMAIN_ID ? 1 : 0, disabled: this.readonly}]
      });
    }
    this._setNewModeState();
    if (this.dataElementForm.get('USE_DOMAIN').value) {
      this.dataElementForm.get('DOMAIN_ID').setValidators(Validators.required);
      this.onChangeDataDomain(this.dataElementForm);
    } else {
      this.dataElementForm.get('DOMAIN_ID').setErrors(null);
      this.dataElementForm.get('DOMAIN_ID').clearValidators();
    }
    this._updateLengthAndDecimal(this.dataElementForm);
  }

  _setNewModeState() {
    if (this.isNewMode) {
      this.dataElementForm.get('ELEMENT_ID').setValidators(this._validateDataElementID);
      this.dataElementForm.get('ELEMENT_ID').setAsyncValidators(
        this.uniqueDataElementValidator.validate.bind(this.uniqueDataElementValidator));
      this.dataElementForm.get('USE_DOMAIN').enable();
      this.dataElementForm.get('DATA_TYPE').enable();
      this.dataElementForm.get('DATA_TYPE').markAsDirty(); // Default value mark as dirty
      this.dataElementForm.get('DATA_LENGTH').markAsDirty(); // Default value mark as dirty
    } else {
      this.dataElementForm.get('ELEMENT_ID').clearValidators();
      this.dataElementForm.get('ELEMENT_ID').clearAsyncValidators() ;
      this.dataElementForm.get('ELEMENT_ID').updateValueAndValidity();
    }
  }

  _validateDataElementID(c: FormControl) {
    if (c.value.trim() === '') {
      return {message: 'Data Element ID is mandatory'};
    }

    if (c.value.toString().toLowerCase() === 'new') {
      return {message: '"NEW/new" is reserved, thus is not allowed to use!'};
    }

    if (c.value.toString().length > 32) {
      return {message: 'Data Element ID must have length less than 32!'};
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
      this.dialogService.confirm('Discard the new Data Element?').subscribe(confirm => {
        if (confirm) {
          this._switch2DisplayMode();
          this.dataElementMeta = null;
          this.modelService.sendDialogAnswer('OK');
        } else {
          this.modelService.sendDialogAnswer('CANCEL');
        }
      });
      return;
    }

    if (!this.readonly) { // In Change Mode -> Display Mode
      if (this.dataElementForm.dirty) {
        this.dialogService.confirm('Discard changes?').subscribe(confirm => {
          if (confirm) { // Discard changes and switch to Display Mode
            this._generateDataElementForm();
            this.dataElementForm.reset(this.dataElementForm.value);
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
    this.dataElementForm.get('USE_DOMAIN').disable();
    this.dataElementForm.get('DATA_TYPE').disable();
    this.dataElementForm.get('SEARCH_HELP_EXPORT_FIELD').disable();
  }

  _switch2EditMode(): void {
    this.readonly = false;
    this.dataElementForm.get('USE_DOMAIN').enable();
    this.dataElementForm.get('SEARCH_HELP_EXPORT_FIELD').enable();
    this._setUseDomain(this.dataElementForm);
  }

  onChangeDataElementID(): void {
    this.modelService.updateDataElementID(this.dataElementForm.get('ELEMENT_ID').value);
  }

  onChangeDataElementDesc(): void {
    this.modelService.updateDataElementDesc(this.dataElementForm.get('ELEMENT_DESC').value);
  }

  onChangeUseDomain(formGroup: AbstractControl): void {
    this._setUseDomain(formGroup, true);
  }

  onChangeDataDomain(formGroup: AbstractControl): void {
    const dataDomainCtrl = formGroup.get('DOMAIN_ID');
    this.entityService.getDataDomain(dataDomainCtrl.value).subscribe(data => {
      if (data['msgCat']) {
        dataDomainCtrl.setErrors({message: data['msgShortText']});
      } else {
        formGroup.get('DATA_TYPE').setValue(data['DATA_TYPE']);
        formGroup.get('DATA_LENGTH').setValue(data['DATA_LENGTH']);
        formGroup.get('DECIMAL').setValue(data['DECIMAL']);
      }
    });
  }

  _setUseDomain(formGroup: AbstractControl, markAsDirty: boolean = false): void {
    if (formGroup.get('USE_DOMAIN').value) {
      formGroup.get('DOMAIN_ID').enable();
      formGroup.get('DOMAIN_ID').setValidators(Validators.required);
      this._invalidField(formGroup.get('DATA_TYPE'), markAsDirty);
      this._invalidField(formGroup.get('DATA_LENGTH'), markAsDirty);
      this._invalidField(formGroup.get('DECIMAL'), markAsDirty);
    } else {
      this._invalidField(formGroup.get('DOMAIN_ID'), markAsDirty);
      formGroup.get('DATA_TYPE').enable();
      formGroup.get('DATA_TYPE').markAsDirty();
      formGroup.get('DATA_LENGTH').enable();
      formGroup.get('DATA_LENGTH').markAsDirty();
      formGroup.get('DECIMAL').enable();
      formGroup.get('DECIMAL').markAsDirty();
      if (!formGroup.get('DATA_TYPE').value) {
        formGroup.get('DATA_TYPE').setValue(1);
        if (!formGroup.get('DATA_LENGTH').value) {
          formGroup.get('DATA_LENGTH').setValue(10);
        }
      }
      this._updateLengthAndDecimal(formGroup);
    }
  }

  _invalidField(fieldCtrl: AbstractControl, markAsDirty: boolean = false): void {
    fieldCtrl.clearValidators();
    fieldCtrl.clearAsyncValidators();
    fieldCtrl.disable();
    if (markAsDirty) {
      fieldCtrl.setValue(null);
      fieldCtrl.markAsDirty();
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
        formGroup.get('DATA_LENGTH').setValidators(this._validateDataLength);
        formGroup.get('DECIMAL').disable();
        break;
      case 4: // decimal
        formGroup.get('DATA_LENGTH').enable();
        formGroup.get('DATA_LENGTH').setValidators(this._validateDataLength);
        formGroup.get('DECIMAL').enable();
        formGroup.get('DATA_LENGTH').setValidators(this._validateDecimal);
        break;
      default:
        formGroup.get('DATA_LENGTH').disable();
        formGroup.get('DECIMAL').disable();
    }
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.isNewMode || (!this.bypassProtection && this.dataElementForm && this.dataElementForm.dirty)) {
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
    if (!this.dataElementForm.dirty) {
      return this.messageService.reportMessage('MODEL', 'NO_CHANGE', 'S');
    }

    if (this.dataElementForm.invalid) {
      return this.messageService.reportMessage('MODEL', 'INVALID_DATA', 'E');
    }

    if (this.isNewMode) {
      this.changedDataElement['action'] = 'add';
      this.changedDataElement['ELEMENT_ID'] = this.dataElementForm.get('ELEMENT_ID').value;
    } else {
      this.changedDataElement['action'] = 'update';
      this.changedDataElement['ELEMENT_ID'] = this.dataElementMeta.ELEMENT_ID;
    }
    if (this.dataElementForm.get('ELEMENT_DESC').dirty) {
      this.changedDataElement['ELEMENT_DESC'] = this.dataElementForm.get('ELEMENT_DESC').value;
    }
    if (this.dataElementForm.get('DOMAIN_ID').dirty) {
      this.changedDataElement['DOMAIN_ID'] = this.dataElementForm.get('DOMAIN_ID').value;
    }
    if (this.dataElementForm.get('DATA_TYPE').dirty) {
      this.changedDataElement['DATA_TYPE'] = this.dataElementForm.get('USE_DOMAIN').value ?
        null : this.dataElementForm.get('DATA_TYPE').value;
    }
    if (this.dataElementForm.get('DATA_LENGTH').dirty) {
      this.changedDataElement['DATA_LENGTH'] = this.dataElementForm.get('USE_DOMAIN').value ?
        null : this.dataElementForm.get('DATA_LENGTH').value;
    }
    if (this.dataElementForm.get('DECIMAL').dirty) {
      this.changedDataElement['DECIMAL'] = this.dataElementForm.get('USE_DOMAIN').value ?
        null : this.dataElementForm.get('DECIMAL').value;
    }
    if (this.dataElementForm.get('LABEL_TEXT').dirty) {
      this.changedDataElement['LABEL_TEXT'] = this.dataElementForm.get('LABEL_TEXT').value;
    }
    if (this.dataElementForm.get('LIST_HEADER_TEXT').dirty) {
      this.changedDataElement['LIST_HEADER_TEXT'] = this.dataElementForm.get('LIST_HEADER_TEXT').value;
    }
    if (this.dataElementForm.get('SEARCH_HELP_ID').dirty) {
      this.changedDataElement['SEARCH_HELP_ID'] = this.dataElementForm.get('SEARCH_HELP_ID').value;
    }
    if (this.dataElementForm.get('SEARCH_HELP_EXPORT_FIELD').dirty) {
      this.changedDataElement['SEARCH_HELP_EXPORT_FIELD'] = this.dataElementForm.get('SEARCH_HELP_EXPORT_FIELD').value;
    }
    if (this.dataElementForm.get('PARAMETER_ID').dirty) {
      this.changedDataElement['PARAMETER_ID'] = this.dataElementForm.get('PARAMETER_ID').value;
    }
    this.entityService.saveDataElement(this.changedDataElement)
      .subscribe(data => this._postActivityAfterSavingDataElement(data));
  }

  _postActivityAfterSavingDataElement(data: any) {
    this.changedDataElement = {};
    if (data['ELEMENT_ID']) {
      if (this.isNewMode) {
        this.isNewMode = false;
        this.bypassProtection = true;
        this.router.navigate(['/model/data-element/' + data['ELEMENT_ID']],
          {state: {message: this.messageService.generateMessage(
            'MODEL', 'DATA_ELEMENT_SAVED', 'S', data['ELEMENT_ID'])}});
      } else {
        this._switch2DisplayMode();
        this.dataElementMeta = data;
        this._generateDataElementForm();
        this.messageService.reportMessage(
          'MODEL', 'DATA_ELEMENT_SAVED', 'S', data['ELEMENT_ID']);
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
