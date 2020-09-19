import {Component, OnInit, ViewChild} from '@angular/core';
import {SearchHelpMeta, EntityService, SearchHelp, SearchHelpComponent, SearchHelpMethod, Attribute, RelationMeta} from 'jor-angular';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {UniqueSearchHelpValidator} from '../../model-validators';
import {Message, MessageService} from 'ui-message-angular';
import {ModelService} from '../../model.service';
import {DialogService} from '../../../dialog.service';
import {switchMap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';

@Component({
  selector: 'app-search-help-detail',
  templateUrl: './search-help-detail.component.html',
  styleUrls: ['./search-help-detail.component.css']
})
export class SearchHelpDetailComponent implements OnInit {

  searchHelpMeta: SearchHelpMeta;
  readonly = true;
  isNewMode = false;
  searchHelpForm: FormGroup;
  changedSearchHelp = {};
  relationsOfEntity = [];
  bypassProtection = false;
  isSearchListShown = true;
  behaviours = [
    {key: 'A', value: 'Search automatically when popup'},
    {key: 'M', value: 'Search manually'}
  ];
  relationAttributesMap = {};
  entitySearchHelp: SearchHelp;

  @ViewChild(SearchHelpComponent, {static: false})
  private searchHelpComponent !: SearchHelpComponent;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private fb: FormBuilder,
              private uniqueSearchHelpValidator: UniqueSearchHelpValidator,
              private messageService: MessageService,
              private modelService: ModelService,
              private dialogService: DialogService,
              private entityService: EntityService) {
  }

  get searchHelpFieldsFormArray() {
    return this.searchHelpForm.get('FIELDS') as FormArray;
  }

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        const searchHelpID = params.get('searchHelpID');
        if (searchHelpID === 'new') {
          const searchHelp = new SearchHelpMeta();
          searchHelp.SEARCH_HELP_ID = '';
          searchHelp.SEARCH_HELP_DESC = '';
          searchHelp.BEHAVIOUR = 'A'; // A: Auto-Trigger Search, M: Manual-Trigger Search
          this.isNewMode = true;
          this.readonly = false;
          this.bypassProtection = false;
          return of(searchHelp);
        } else {
          this.readonly = true;
          this.isNewMode = false;
          return this.entityService.getSearchHelp(searchHelpID);
        }
      })
    ).subscribe(data => {
      if ( 'msgName' in data) {
        this.messageService.clearMessages();
        this.searchHelpMeta = null;
        this.searchHelpForm = null;
        this.messageService.report(<Message>data);
      } else {
        this.messageService.clearMessages();
        if (history.state.message) {
          this.messageService.report(history.state.message);
        }
        this.searchHelpMeta = <SearchHelpMeta>data;
        this._generateSearchHelpForm();
        this._getRelationsOfEntity( this.searchHelpForm, false);
        this.searchHelpFieldsFormArray.controls.forEach( field =>
          this._getAttributesOfRelation(field, false ));
      }
    });

    this.modelService.isSearchListShown$.subscribe( data => this.isSearchListShown = data);
  }

  showSearchList(): void {
    this.isSearchListShown = true;
    this.modelService.showSearchList();
  }

  _generateSearchHelpForm(): void {
    if (this.searchHelpForm) {
      this.searchHelpForm.markAsPristine({onlySelf: false});
      this.searchHelpForm.get('SEARCH_HELP_ID').setValue(this.searchHelpMeta.SEARCH_HELP_ID);
      this.searchHelpForm.get('SEARCH_HELP_DESC').setValue(this.searchHelpMeta.SEARCH_HELP_DESC);
      this.searchHelpForm.get('ENTITY_ID').setValue(this.searchHelpMeta.ENTITY_ID);
      this.searchHelpForm.get('RELATION_ID').setValue(this.searchHelpMeta.RELATION_ID);
      this.searchHelpForm.get('BEHAVIOUR').setValue(this.searchHelpMeta.BEHAVIOUR);
      this.searchHelpForm.get('MULTI').setValue(this.searchHelpMeta.MULTI);
      this.searchHelpForm.get('FUZZY_SEARCH').setValue(this.searchHelpMeta.FUZZY_SEARCH);
      this.searchHelpFieldsFormArray.clear();
      if (this.readonly) {
        this.searchHelpForm.get('BEHAVIOUR').disable();
        this.searchHelpForm.get('MULTI').disable();
        this.searchHelpForm.get('FUZZY_SEARCH').disable();
        this.searchHelpForm.get('RELATION_ID').disable();
      }
    } else {
      this.searchHelpForm = this.fb.group({
        SEARCH_HELP_ID: [this.searchHelpMeta.SEARCH_HELP_ID, {updateOn: 'blur'}],
        SEARCH_HELP_DESC: [this.searchHelpMeta.SEARCH_HELP_DESC],
        ENTITY_ID: [this.searchHelpMeta.ENTITY_ID],
        RELATION_ID: [{value: this.searchHelpMeta.RELATION_ID, disabled: this.readonly}],
        BEHAVIOUR: [{value: this.searchHelpMeta.BEHAVIOUR, disabled: this.readonly}],
        MULTI: [{value: this.searchHelpMeta.MULTI, disabled: this.readonly}],
        FUZZY_SEARCH: [{value: this.searchHelpMeta.FUZZY_SEARCH, disabled: this.readonly}],
        FIELDS: this.fb.array([])
      });
    }
    this._setNewModeState();

    if (this.searchHelpMeta.FIELDS) {
      this.searchHelpMeta.FIELDS.forEach( field => {
        this.searchHelpFieldsFormArray.push(
          this.fb.group({
            RELATION_ID: [{value: field.RELATION_ID, disabled: this.readonly}],
            FIELD_NAME: [{value: field.FIELD_NAME, disabled: this.readonly}],
            FIELD_DESC: [field.FIELD_DESC],
            IMPORT: [{value: field.IMPORT, disabled: this.readonly}],
            EXPORT: [{value: field.EXPORT, disabled: this.readonly}],
            IE_FIELD_NAME: [field.IE_FIELD_NAME],
            LIST_POSITION: [field.LIST_POSITION],
            FILTER_POSITION: [field.FILTER_POSITION],
            FILTER_DISP_ONLY: [{value: field.FILTER_DISP_ONLY, disabled: this.readonly}],
            DEFAULT_VALUE: [field.DEFAULT_VALUE]
          })
        );
      });
    }
  }

  _setNewModeState() {
    if (this.isNewMode) {
      this.searchHelpForm.get('SEARCH_HELP_ID').setValidators(this._validateSearchHelpID);
      this.searchHelpForm.get('SEARCH_HELP_ID').setAsyncValidators(
        this.uniqueSearchHelpValidator.validate.bind(this.uniqueSearchHelpValidator));
      this.searchHelpForm.get('BEHAVIOUR').enable();
      this.searchHelpForm.get('MULTI').enable();
      this.searchHelpForm.get('FUZZY_SEARCH').enable();
      this.searchHelpForm.get('RELATION_ID').enable();
      this.searchHelpForm.get('BEHAVIOUR').markAsDirty(); // Default value mark as dirty
    } else {
      this.searchHelpForm.get('SEARCH_HELP_ID').clearValidators();
      this.searchHelpForm.get('SEARCH_HELP_ID').clearAsyncValidators();
      this.searchHelpForm.get('SEARCH_HELP_ID').updateValueAndValidity();
    }
  }

  _validateSearchHelpID(c: FormControl) {
    if (c.value.trim() === '') {
      return {message: 'Search Help ID is mandatory'};
    }

    if (c.value.toString().toLowerCase() === 'new') {
      return {message: '"NEW/new" is reserved, thus is not allowed to use!'};
    }

    if (c.value.toString().length > 32) {
      return {message: 'Search Help ID must have length less than 32!'};
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
      this.dialogService.confirm('Discard the new Search Help?').subscribe(confirm => {
        if (confirm) {
          this._switch2DisplayMode();
          this.searchHelpMeta = null;
          this.modelService.sendDialogAnswer('OK');
        } else {
          this.modelService.sendDialogAnswer('CANCEL');
        }
      });
      return;
    }

    if (!this.readonly) { // In Change Mode -> Display Mode
      if (this.searchHelpForm.dirty) {
        this.dialogService.confirm('Discard changes?').subscribe(confirm => {
          if (confirm) { // Discard changes and switch to Display Mode
            this._generateSearchHelpForm();
            this.searchHelpForm.reset(this.searchHelpForm.value);
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
    this.searchHelpForm.get('BEHAVIOUR').disable();
    this.searchHelpForm.get('MULTI').disable();
    this.searchHelpForm.get('FUZZY_SEARCH').disable();
    this.searchHelpForm.get('RELATION_ID').disable();
    this.searchHelpFieldsFormArray.controls.forEach(field => {
      field.get('RELATION_ID').disable();
      field.get('FIELD_NAME').disable();
      field.get('IMPORT').disable();
      field.get('EXPORT').disable();
      field.get('FILTER_DISP_ONLY').disable();
    });
  }

  _switch2EditMode(): void {
    this.readonly = false;
    this.searchHelpForm.get('BEHAVIOUR').enable();
    this.searchHelpForm.get('MULTI').enable();
    this.searchHelpForm.get('FUZZY_SEARCH').enable();
    this.searchHelpForm.get('RELATION_ID').enable();
    this.searchHelpFieldsFormArray.controls.forEach(field => {
      field.get('RELATION_ID').enable();
      field.get('FIELD_NAME').enable();
      field.get('IMPORT').enable();
      field.get('EXPORT').enable();
      field.get('FILTER_DISP_ONLY').enable();
    });
  }

  onChangeSearchHelpID(): void {
    this.modelService.updateSearchHelpID(this.searchHelpForm.get('SEARCH_HELP_ID').value);
  }

  onChangeSearchHelpDesc(): void {
    this.modelService.updateSearchHelpDesc(this.searchHelpForm.get('SEARCH_HELP_DESC').value);
  }

  onEntitySearchHelp(control: AbstractControl): void {
    if (!this.entitySearchHelp) {
      this.entitySearchHelp = new SearchHelp();
      this.entitySearchHelp.OBJECT_NAME = 'Entity ID';
      this.entitySearchHelp.METHOD = function(entityService: EntityService): SearchHelpMethod {
        return (searchTerm: string): Observable<object[]> => entityService.listEntityType(searchTerm);
      }(this.entityService);
      this.entitySearchHelp.BEHAVIOUR = 'M';
      this.entitySearchHelp.MULTI = false;
      this.entitySearchHelp.FUZZY_SEARCH = true;
      this.entitySearchHelp.FIELDS = [
        {FIELD_NAME: 'ENTITY_ID', LIST_HEADER_TEXT: 'Entity', IMPORT: true, EXPORT: true, LIST_POSITION: 1, FILTER_POSITION: 0},
        {FIELD_NAME: 'ENTITY_DESC', LIST_HEADER_TEXT: 'Description', IMPORT: true, EXPORT: true, LIST_POSITION: 2, FILTER_POSITION: 0}
      ];
      this.entitySearchHelp.READ_ONLY = this.readonly;
    }
    const afterExportFn = function (context: any) {
      return () => context.onChangeEntityID(control);
    }(this).bind(this);
    this.searchHelpComponent.openSearchHelpModal(this.entitySearchHelp, control, afterExportFn);
  }

  onChangeEntityID(formGroup: AbstractControl): void {
    this._getRelationsOfEntity(formGroup, true);
  }

  _getRelationsOfEntity(searchHelpForm: AbstractControl, setDefault: boolean): void {
    const domainEntityID = searchHelpForm.get('ENTITY_ID').value;
    if (!domainEntityID) { return; }
    this.entityService.getRelationMetaOfEntity(domainEntityID)
      .subscribe(entityRelations => {
        if (entityRelations[0]['msgType'] === 'E') {
          searchHelpForm.get('ENTITY_ID').setErrors({message: entityRelations[0]['msgShortText']});
        } else {
          this.relationsOfEntity = entityRelations.map(relationMeta => relationMeta.RELATION_ID )
            .filter(relationId => relationId.substr(0, 2) !== 'rs' );
          if (setDefault) {
            searchHelpForm.get('RELATION_ID').setValue(this.relationsOfEntity[0]);
            searchHelpForm.get('RELATION_ID').markAsDirty();
            this._getAttributesOfRelation(searchHelpForm, true);
          }
        }
      });
  }

  onChangeRelationID(formGroup: AbstractControl): void {
    this._getAttributesOfRelation(formGroup, true);
  }
  _getAttributesOfRelation(formGroup: AbstractControl, afterChanges: boolean): void {
    const relationID = formGroup.get('RELATION_ID').value;
    if (!relationID) { return; }
    if (this.relationAttributesMap[relationID]) {
      if (afterChanges) {
        this._afterChangeRelationID(formGroup);
      } else {
        this.onChangeField(formGroup);
      }
    } else {
      this.entityService.getRelationMeta(relationID)
        .subscribe((relationMeta: RelationMeta) => {
          this.relationAttributesMap[relationID] = relationMeta.ATTRIBUTES;
          if (afterChanges) {
            this._afterChangeRelationID(formGroup);
          } else {
            this.onChangeField(formGroup);
          }
        });
    }
  }
  _afterChangeRelationID(formGroup: AbstractControl): void {
    const relationID = formGroup.get('RELATION_ID').value;
    if (formGroup.get('FIELD_NAME')) { // Search help field level relation ID change
      formGroup.get('FIELD_NAME').setValue(this.relationAttributesMap[relationID][0]['ATTR_NAME']);
      formGroup.get('FIELD_NAME').markAsDirty();
      formGroup.get('FIELD_DESC').setValue(this.relationAttributesMap[relationID][0]['ATTR_DESC']);
    } else { // Search help head level relation ID change
      this.searchHelpFieldsFormArray.clear();
      this.relationAttributesMap[relationID].forEach( (attribute: Attribute) => {
        this.searchHelpFieldsFormArray.push(
          this.fb.group({
            RELATION_ID: [attribute.RELATION_ID],
            FIELD_NAME: [attribute.ATTR_NAME],
            FIELD_DESC: [attribute.ATTR_DESC],
            IMPORT: [attribute.PRIMARY_KEY],
            EXPORT: [attribute.PRIMARY_KEY],
            IE_FIELD_NAME: [''],
            LIST_POSITION: [attribute.ORDER],
            FILTER_POSITION: [attribute.ORDER],
            FILTER_DISP_ONLY: [false],
            DEFAULT_VALUE: ['']
          })
        );
      });
      this.searchHelpFieldsFormArray.markAsDirty();
    }
  }

  onChangeField(formGroup: AbstractControl): void {
    const relationID = formGroup.get('RELATION_ID').value;
    const currAttr = <Attribute>this.relationAttributesMap[relationID].find(
      (attribute: Attribute) => attribute.ATTR_NAME === formGroup.get('FIELD_NAME').value);
    formGroup.get('FIELD_DESC').setValue(currAttr.ATTR_DESC);
  }

  insertField(index: number): void {
    const mainRelationID = this.searchHelpForm.get('RELATION_ID').value;
    const firstAttribute = <Attribute>this.relationAttributesMap[mainRelationID][0];
    this.searchHelpFieldsFormArray.insert(index, this.fb.group({
      RELATION_ID: [mainRelationID],
      FIELD_NAME: [firstAttribute.ATTR_NAME],
      FIELD_DESC: [firstAttribute.ATTR_DESC],
      IMPORT: [firstAttribute.PRIMARY_KEY],
      EXPORT: [firstAttribute.PRIMARY_KEY],
      IE_FIELD_NAME: [''],
      LIST_POSITION: [0],
      FILTER_POSITION: [0],
      FILTER_DISP_ONLY: [false],
      DEFAULT_VALUE: ['']
    }));
  }

  deleteField(index: number): void {
    if (this.searchHelpFieldsFormArray.length === 1) {
      this.messageService.reportMessage('MODEL', 'MINIMUM_ONE_SEARCH_FIELD', 'E');
      return;
    }
    this.searchHelpFieldsFormArray.removeAt(index);
    this.searchHelpFieldsFormArray.markAsDirty();
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.isNewMode || (!this.bypassProtection && this.searchHelpForm && this.searchHelpForm.dirty)) {
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
    if (!this.searchHelpForm.dirty) {
      return this.messageService.reportMessage('MODEL', 'NO_CHANGE', 'S');
    }

    if (this.searchHelpForm.invalid) {
      return this.messageService.reportMessage('MODEL', 'INVALID_DATA', 'E');
    }

    if (this.isNewMode) {
      this.changedSearchHelp['action'] = 'add';
      this.changedSearchHelp['SEARCH_HELP_ID'] = this.searchHelpForm.get('SEARCH_HELP_ID').value;
    } else {
      this.changedSearchHelp['action'] = 'update';
      this.changedSearchHelp['SEARCH_HELP_ID'] = this.searchHelpMeta.SEARCH_HELP_ID;
    }
    if (this.searchHelpForm.get('SEARCH_HELP_DESC').dirty) {
      this.changedSearchHelp['SEARCH_HELP_DESC'] = this.searchHelpForm.get('SEARCH_HELP_DESC').value;
    }
    if (this.searchHelpForm.get('BEHAVIOUR').dirty) {
      this.changedSearchHelp['BEHAVIOUR'] = this.searchHelpForm.get('BEHAVIOUR').value;
    }
    if (this.searchHelpForm.get('MULTI').dirty) {
      this.changedSearchHelp['MULTI'] = this.searchHelpForm.get('MULTI').value;
    }
    if (this.searchHelpForm.get('FUZZY_SEARCH').dirty) {
      this.changedSearchHelp['FUZZY_SEARCH'] = this.searchHelpForm.get('FUZZY_SEARCH').value;
    }
    if (this.searchHelpForm.get('ENTITY_ID').dirty) {
      this.changedSearchHelp['ENTITY_ID'] = this.searchHelpForm.get('ENTITY_ID').value;
    }
    if (this.searchHelpForm.get('RELATION_ID').dirty) {
      this.changedSearchHelp['RELATION_ID'] = this.searchHelpForm.get('RELATION_ID').value;
    }
    if (this.searchHelpForm.get('FIELDS').dirty) {
      this.changedSearchHelp['FIELDS'] = [];
      this.searchHelpForm.get('FIELDS').value.forEach( field => {
        if (field.FIELD_NAME) {
          this.changedSearchHelp['FIELDS'].push(field);
        }
      });
    }
    this.entityService.saveSearchHelp(this.changedSearchHelp)
      .subscribe(data => this._postActivityAfterSavingSearchHelp(data));
  }

  _postActivityAfterSavingSearchHelp(data: any) {
    this.changedSearchHelp = {};
    if (data['SEARCH_HELP_ID']) {
      if (this.isNewMode) {
        this.isNewMode = false;
        this.bypassProtection = true;
        this.router.navigate(['/model/search-help/' + data['SEARCH_HELP_ID']],
          {state: {message: this.messageService.generateMessage(
                'MODEL', 'SEARCH_HELP_SAVED', 'S', data['SEARCH_HELP_ID'])}});
      } else {
        this._switch2DisplayMode();
        this.searchHelpMeta = data;
        this._generateSearchHelpForm();
        this.searchHelpFieldsFormArray.controls.forEach( field =>
          this._getAttributesOfRelation(field, false ));
        this.messageService.reportMessage('MODEL', 'SEARCH_HELP_SAVED', 'S', data['SEARCH_HELP_ID']);
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
