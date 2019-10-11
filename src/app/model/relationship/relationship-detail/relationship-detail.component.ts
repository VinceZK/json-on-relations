import {Component, OnInit, ViewChild} from '@angular/core';
import {Attribute, RelationshipMeta} from 'jor-angular';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {AttributeMetaComponent} from '../../attribute-meta/attribute-meta.component';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {Message, MessageService} from 'ui-message-angular';
import {ModelService} from '../../model.service';
import {DialogService} from '../../../dialog.service';
import {EntityService} from 'jor-angular';
import {msgStore} from '../../../msgStore';
import {switchMap} from 'rxjs/operators';
import {forkJoin, Observable, of} from 'rxjs';
import {UniqueRelationshipValidator} from '../../model-validators';
import {SearchHelp, SearchHelpMethod} from 'jor-angular';
import {SearchHelpComponent} from 'jor-angular';

@Component({
  selector: 'app-relationship-detail',
  templateUrl: './relationship-detail.component.html',
  styleUrls: ['./relationship-detail.component.css']
})
export class RelationshipDetailComponent implements OnInit {
  relationshipMeta: RelationshipMeta;
  attributes: Attribute[];
  readonly = true;
  isNewMode = false;
  relationshipForm: FormGroup;
  changedRelationship = {};
  bypassProtection = false;
  isSearchListShown = true;

  @ViewChild(AttributeMetaComponent, {static: false})
  private attrComponent!: AttributeMetaComponent;
  @ViewChild(SearchHelpComponent, {static: false})
  private searchHelpComponent!: SearchHelpComponent;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private fb: FormBuilder,
              private uniqueRelationshipValidator: UniqueRelationshipValidator,
              private messageService: MessageService,
              private modelService: ModelService,
              private dialogService: DialogService,
              private entityService: EntityService) {
    this.messageService.setMessageStore(msgStore, 'EN');
  }

  get involveFormArray() {
    return this.relationshipForm.get('INVOLVES') as FormArray;
  }

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        const relationshipID = params.get('relationshipID');
        if (relationshipID === 'new') {
          const relationship = new RelationshipMeta();
          relationship.RELATIONSHIP_ID = 'rs_';
          relationship.RELATIONSHIP_DESC = '';
          relationship.VALID_PERIOD = 0;
          relationship.INVOLVES = [];
          this.isNewMode = true;
          this.readonly = false;
          this.bypassProtection = false;
          return forkJoin(of(relationship), of([]));
        } else {
          this.readonly = true;
          this.isNewMode = false;
          return forkJoin(
            this.entityService.getRelationship(relationshipID),
            this.entityService.getRelationMeta(relationshipID));
        }
      })
    ).subscribe(data => {
      if ( 'msgName' in data[0]) {
        this.messageService.clearMessages();
        this.relationshipMeta = null;
        this.relationshipForm = null;
        this.messageService.report(<Message>data[0]);
      } else {
        this.messageService.clearMessages();
        this.relationshipMeta = data[0];
        this.attributes = 'msgName' in data[1] ? [] : data[1]['ATTRIBUTES'];
        this._generateRelationshipForm();
        if (this.readonly) { this.relationshipForm.get('TIME_DEPENDENT').disable(); }
      }
    });

    this.modelService.isSearchListShown$.subscribe( data => this.isSearchListShown = data);
  }

  showSearchList(): void {
    this.isSearchListShown = true;
    this.modelService.showSearchList();
  }

  onSearchHelp(control: AbstractControl, rowID: number): void {
    const searchHelpMeta = new SearchHelp();
    searchHelpMeta.OBJECT_NAME = 'Role';
    searchHelpMeta.METHOD = function(entityService: EntityService): SearchHelpMethod {
      return (searchTerm: string): Observable<object[]> => entityService.listRole(searchTerm);
    }(this.entityService);
    searchHelpMeta.BEHAVIOUR = 'A';
    searchHelpMeta.MULTI = false;
    searchHelpMeta.FUZZY_SEARCH = true;
    searchHelpMeta.FIELDS = [
      {FIELD_NAME: 'ROLE_ID', FIELD_DESC: 'Role', IMPORT: true, EXPORT: true, LIST_POSITION: 1, FILTER_POSITION: 0},
      {FIELD_NAME: 'ROLE_DESC', FIELD_DESC: 'Description', IMPORT: true, EXPORT: true, LIST_POSITION: 2, FILTER_POSITION: 0}
    ];
    searchHelpMeta.READ_ONLY = this.readonly || this.oldInvolve(control) && control.valid;

    const afterExportFn = function (context: any, ruleIdx: number) {
      return () => context.onChangeRoleID(ruleIdx, true);
    }(this, rowID).bind(this);
    this.searchHelpComponent.openSearchHelpModal(searchHelpMeta, control, afterExportFn);
  }

  _generateRelationshipForm(): void {
    if (this.relationshipForm) {
      this.relationshipForm.markAsPristine({onlySelf: false});
      this.relationshipForm.get('RELATIONSHIP_ID').setValue(this.relationshipMeta.RELATIONSHIP_ID);
      this.relationshipForm.get('RELATIONSHIP_DESC').setValue(this.relationshipMeta.RELATIONSHIP_DESC);
      this.relationshipForm.get('TIME_DEPENDENT').setValue(this.relationshipMeta.VALID_PERIOD > 0);
      this.relationshipForm.get('VALID_PERIOD').setValue(this.relationshipMeta.VALID_PERIOD);
      this.relationshipForm.removeControl('ATTRIBUTES');
    } else {
      this.relationshipForm = this.fb.group({
        RELATIONSHIP_ID: [this.relationshipMeta.RELATIONSHIP_ID, {updateOn: 'blur'}],
        RELATIONSHIP_DESC: [this.relationshipMeta.RELATIONSHIP_DESC],
        TIME_DEPENDENT: [this.relationshipMeta.VALID_PERIOD > 0],
        VALID_PERIOD: [this.relationshipMeta.VALID_PERIOD, this._validateValidPeriod]
      });
    }

    // Compose Involves
    const formArray = [];
    this.relationshipMeta.INVOLVES.forEach( involve => {
      formArray.push(this.fb.group({
        ROLE_ID: [involve.ROLE_ID],
        ROLE_DESC: [involve.ROLE_DESC],
        CARDINALITY: [{value: involve.CARDINALITY, disabled: this.readonly}],
        DIRECTION: [involve.DIRECTION]
      }));
    });

    if (this.isNewMode) {
      this.relationshipForm.get('RELATIONSHIP_ID').setValidators(this._validateRelationshipID);
      this.relationshipForm.get('RELATIONSHIP_ID').setAsyncValidators(
        this.uniqueRelationshipValidator.validate.bind(this.uniqueRelationshipValidator));
      this.relationshipForm.get('TIME_DEPENDENT').enable();
      formArray.push(
        this.fb.group({
          ROLE_ID: [''],
          ROLE_DESC: [''],
          CARDINALITY: ['[1..1]'],
          DIRECTION: ['']
        }));
    } else {
      this.relationshipForm.get('RELATIONSHIP_ID').clearValidators();
      this.relationshipForm.get('RELATIONSHIP_ID').clearAsyncValidators();
    }

    this.relationshipForm.setControl('INVOLVES', new FormArray(formArray));
  }

  _validateRelationshipID(c: FormControl) {
    if (c.value.trim() === '') {
      return {message: 'Relationship ID is mandatory'};
    }

    if (c.value.toString().toLowerCase() === 'new') {
      return {message: '"NEW/new" is reserved, thus is not allowed to use!'};
    }

    if (c.value.toString().toLowerCase().substr(0, 3) !== 'rs_') {
      return {message: 'Relationship ID must be started with "rs_"!'};
    }

    if (c.value.toString().length < 4) {
      return {message: 'Relationship ID must have length larger than 3!'};
    }
    if (c.value.toString().length > 32) {
      return {message: 'Relationship ID must have length less than 32!'};
    }
    return null;
  }

  _validateValidPeriod(c: FormControl) {
    if (c.parent && c.parent.value.TIME_DEPENDENT && c.value <= 0) {
      return {message: 'must be larger than 0'};
    }
    return null;
  }

  switchEditDisplay() {
    if (this.isNewMode) {
      this.dialogService.confirm('Discard the new Relationship?').subscribe(confirm => {
        if (confirm) {
          this._switch2DisplayMode();
          this.relationshipMeta = null;
          this.modelService.sendDialogAnswer('OK');
        } else {
          this.modelService.sendDialogAnswer('CANCEL');
        }
      });
      return;
    }

    if (!this.readonly) { // In Change Mode -> Display Mode
      if (this.relationshipForm.dirty) {
        this.dialogService.confirm('Discard changes?').subscribe(confirm => {
          if (confirm) { // Discard changes and switch to Display Mode
            this._generateRelationshipForm();
            this.relationshipForm.reset(this.relationshipForm.value);
            this._switch2DisplayMode();
          }
        });
      } else { // Switch to display mode
        this._switch2DisplayMode();
      }
    } else { // In Display Mode -> Change Mode
      this.readonly = false;
      this.relationshipForm.get('TIME_DEPENDENT').enable();
      this.attrComponent.switchEditDisplay(this.readonly);
      this.involveFormArray.controls.forEach(involveFormGroup => {
        involveFormGroup.get('CARDINALITY').enable();
      });
      this.involveFormArray.push(
        this.fb.group({
          ROLE_ID: [''],
          ROLE_DESC: [''],
          CARDINALITY: ['[1..1]'],
          DIRECTION: ['']
        })
      );
    }

    this.messageService.clearMessages();
  }

  _switch2DisplayMode(): void {
    this.readonly = true;
    this.relationshipForm.get('TIME_DEPENDENT').disable();
    this.attrComponent.switchEditDisplay(this.readonly);
    let lastIndex = this.involveFormArray.length - 1;
    while (lastIndex >= 0 && this.involveFormArray.controls[lastIndex].get('ROLE_ID').value.trim() === '') {
      this.involveFormArray.removeAt(lastIndex);
      lastIndex--;
    }
    this.involveFormArray.controls.forEach(involveFormGroup => {
      involveFormGroup.get('CARDINALITY').disable();
    });
  }

  onChangeRelationshipID(): void {
    this.modelService.updateRelationshipID(this.relationshipForm.get('RELATIONSHIP_ID').value);
  }

  onChangeTimeDependency(): void {
    const timeDependent = this.relationshipForm.get('TIME_DEPENDENT').value;
    const validPeriodCtrl = this.relationshipForm.get('VALID_PERIOD');
    const relationID = this.relationshipForm.get('RELATIONSHIP_ID').value;
    const attrFormArray = this.relationshipForm.get('ATTRIBUTES') as FormArray;
    if (timeDependent) {
      validPeriodCtrl.setValue(28080000); // 3600 * 24 * 365
      validPeriodCtrl.markAsDirty();
      validPeriodCtrl.enable();
      const validFromFormGroup = this.fb.group({
        ATTR_GUID: [''],
        RELATION_ID: [relationID],
        ATTR_NAME: ['VALID_FROM'],
        ATTR_DESC: ['Valid from'],
        DATA_ELEMENT: [''],
        DATA_TYPE: [{value: 8, disabled: true}],
        DATA_LENGTH: [null],
        DECIMAL: [null],
        PRIMARY_KEY: [false],
        AUTO_INCREMENT: [false]
      });
      validFromFormGroup.markAsDirty();
      attrFormArray.insert(attrFormArray.length - 1, validFromFormGroup);
      const validToFormGroup = this.fb.group({
        ATTR_GUID: [''],
        RELATION_ID: [relationID],
        ATTR_NAME: ['VALID_TO'],
        ATTR_DESC: ['Valid to'],
        DATA_ELEMENT: [''],
        DATA_TYPE: [{value: 8, disabled: true}],
        DATA_LENGTH: [null],
        DECIMAL: [null],
        PRIMARY_KEY: [false],
        AUTO_INCREMENT: [false]
      });
      validToFormGroup.markAsDirty();
      attrFormArray.insert(attrFormArray.length - 1, validToFormGroup);
    } else {
      validPeriodCtrl.setValue(0);
      validPeriodCtrl.disable();
      validPeriodCtrl.markAsDirty();
      const attributeValidFromIndex = attrFormArray.controls.findIndex(
        attrCtrl => attrCtrl.get('ATTR_NAME').value === 'VALID_FROM');
      if (attributeValidFromIndex >= 0) { this.attrComponent.deleteAttribute(attributeValidFromIndex); }
      const attributeValidToIndex = attrFormArray.controls.findIndex(
        attrCtrl => attrCtrl.get('ATTR_NAME').value === 'VALID_TO');
      if (attributeValidToIndex >= 0) { this.attrComponent.deleteAttribute(attributeValidToIndex); }
    }

  }

  onChangeRelationshipDesc(): void {
    this.modelService.updateRelationshipDesc(this.relationshipForm.get('RELATIONSHIP_DESC').value);
  }

  deleteInvolve(index: number): void {
    if (index !== this.involveFormArray.length - 1) {
      const currentRoleID = this.involveFormArray.at(index).get('ROLE_ID').value;
      this.involveFormArray.removeAt(index);
      this.involveFormArray.markAsDirty();
      const attrFormArray = this.relationshipForm.get('ATTRIBUTES') as FormArray;
      const attributeInstanceGUIDIndex = attrFormArray.controls.findIndex(
        attrCtrl => attrCtrl.get('ATTR_NAME').value === currentRoleID + '_INSTANCE_GUID');
      if (attributeInstanceGUIDIndex >= 0) { this.attrComponent.deleteAttribute(attributeInstanceGUIDIndex); }
      const attributeEntityIDIndex = attrFormArray.controls.findIndex(
        attrCtrl => attrCtrl.get('ATTR_NAME').value === currentRoleID + '_ENTITY_ID');
      if (attributeEntityIDIndex >= 0) { this.attrComponent.deleteAttribute(attributeEntityIDIndex); }
    }
  }

  onChangeRoleID(index: number): void {
    const currentInvolveFormGroup = this.involveFormArray.controls[index];
    if (this.involveFormArray.controls.findIndex((involveCtrl, i) =>
      i !== index && involveCtrl.get('ROLE_ID').value === currentInvolveFormGroup.get('ROLE_ID').value
    ) !== -1) {
      currentInvolveFormGroup.get('ROLE_ID').setErrors({message: 'Duplicate roles'});
      return;
    }

    if (index === this.involveFormArray.length - 1 && currentInvolveFormGroup.value.ROLE_ID.trim() !== '') {
      // Only work for the last New line
      this.involveFormArray.push(
        this.fb.group({
          ROLE_ID: [''],
          ROLE_DESC: [''],
          CARDINALITY: ['[1..1]'],
          DIRECTION: ['']
        })
      );
    }

    this.entityService.getRoleDesc(currentInvolveFormGroup.value.ROLE_ID).subscribe(data => {
      if (data['msgCat']) {
        currentInvolveFormGroup.get('ROLE_ID').setErrors({message: data['msgShortText']});
      } else {
        currentInvolveFormGroup.get('ROLE_DESC').setValue(data);
        const attrFormArray = this.relationshipForm.get('ATTRIBUTES') as FormArray;
        const relationID = this.relationshipForm.get('RELATIONSHIP_ID').value;
        const instanceGUIDFormGroup = this.fb.group({
          ATTR_GUID: [''],
          RELATION_ID: [relationID],
          ATTR_NAME: [currentInvolveFormGroup.value.ROLE_ID + '_INSTANCE_GUID'],
          ATTR_DESC: ['Entity Instance GUID of role ' + currentInvolveFormGroup.value.ROLE_ID],
          DATA_ELEMENT: [null],
          DATA_TYPE: [{value: 1, disabled: true}],
          DATA_LENGTH: [32],
          DECIMAL: [null],
          PRIMARY_KEY: [false],
          AUTO_INCREMENT: [false]
        });
        instanceGUIDFormGroup.markAsDirty();
        attrFormArray.insert(attrFormArray.length - 1, instanceGUIDFormGroup);
        const entityIDFormGroup = this.fb.group({
          ATTR_GUID: [''],
          RELATION_ID: [relationID],
          ATTR_NAME: [currentInvolveFormGroup.value.ROLE_ID + '_ENTITY_ID'],
          ATTR_DESC: ['Entity ID of role ' + currentInvolveFormGroup.value.ROLE_ID],
          DATA_ELEMENT: [null],
          DATA_TYPE: [{value: 1, disabled: true}],
          DATA_LENGTH: [32],
          DECIMAL: [null],
          PRIMARY_KEY: [false],
          AUTO_INCREMENT: [false]
        });
        entityIDFormGroup.markAsDirty();
        attrFormArray.insert(attrFormArray.length - 1, entityIDFormGroup);
        attrFormArray.markAsDirty();
      }
    });
  }

  oldInvolve(formGroup: AbstractControl): boolean {
    return this.relationshipMeta.INVOLVES.findIndex( role => role.ROLE_ID === formGroup.get('ROLE_ID').value ) !== -1;
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.isNewMode || (!this.bypassProtection && this.relationshipForm && this.relationshipForm.dirty)) {
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
    if (!this.relationshipForm.dirty) {
      return this.messageService.reportMessage('MODEL', 'NO_CHANGE', 'S');
    }

    if (!this.relationshipForm.valid) {
      return this.messageService.reportMessage('MODEL', 'INVALID_DATA', 'E');
    }

    if (this.isNewMode) {
      this.changedRelationship['action'] = 'add';
      this.changedRelationship['RELATIONSHIP_ID'] = this.relationshipForm.controls['RELATIONSHIP_ID'].value;
    } else {
      this.changedRelationship['action'] = 'update';
      this.changedRelationship['RELATIONSHIP_ID'] = this.relationshipMeta.RELATIONSHIP_ID;
    }
    if (this.relationshipForm.controls['RELATIONSHIP_DESC'].dirty) {
      this.changedRelationship['RELATIONSHIP_DESC'] = this.relationshipForm.controls['RELATIONSHIP_DESC'].value;
    }
    if (this.isNewMode || this.relationshipForm.controls['VALID_PERIOD'].dirty) {
      this.changedRelationship['VALID_PERIOD'] = this.relationshipForm.controls['VALID_PERIOD'].value;
    }

    this.changedRelationship['ATTRIBUTES'] = this.attrComponent.processChangedAttributes();

    if (this._processChangedInvolves()) {
      // console.log(this.changedRelationship);
      this.entityService.saveRelationship(this.changedRelationship)
        .subscribe(data => this._postActivityAfterSavingRelationship(data));
    }
  }

  _processChangedInvolves(): boolean {
    if (this.involveFormArray.length <= 2) { // An empty line is included
      this.messageService.reportMessage('MODEL', 'RELATIONSHIP_LACK_INVOLVED_ROLES', 'E');
      return false;
    }
    const changedInvolves = [];
    if (this.involveFormArray.dirty) {
      this.changedRelationship['INVOLVES'] = changedInvolves;

      this.involveFormArray.controls.forEach(involveControl => {
        if (involveControl.get('ROLE_ID').value.trim() === '') { return; }
        let action;
        const index = this.relationshipMeta.INVOLVES.findIndex(
          involve => involveControl.get('ROLE_ID').value === involve.ROLE_ID);
        if (index === -1) { // New Add Case
          action = 'add';
        } else { // New Update Case
          if (involveControl.dirty) { action = 'update'; }
        }
        if (action) {
          changedInvolves.push({ action: action, ROLE_ID: involveControl.get('ROLE_ID').value,
            CARDINALITY: involveControl.get('CARDINALITY').value, DIRECTION: involveControl.get('DIRECTION').value });
        }
      });

      // Deletion Case
      this.relationshipMeta.INVOLVES.forEach(involve => {
        const index = this.involveFormArray.controls.findIndex(
          roleControl => roleControl.get('ROLE_ID').value === involve.ROLE_ID);
        if (index === -1) { // The attribute must be deleted
          const deletedRole = {action: 'delete', ROLE_ID: involve.ROLE_ID};
          changedInvolves.push(deletedRole);
        }
      });
    }
    return true;
  }

  _postActivityAfterSavingRelationship(data: any) {
    this.changedRelationship = {};
    if (data[0] && data[0]['RELATIONSHIP_ID']) {
      if (this.isNewMode) {
        this.isNewMode = false;
        this.bypassProtection = true;
        this.router.navigate(['/model/relationship/' + data[0]['RELATIONSHIP_ID']]);
      } else {
        this.readonly = true;
        this.relationshipForm.get('TIME_DEPENDENT').disable();
        this.relationshipMeta = data[0];
        this.attributes = data[1].ATTRIBUTES;
        this._generateRelationshipForm();
        this.messageService.reportMessage('MODEL', 'RELATIONSHIP_SAVED', 'S', this.relationshipMeta.RELATIONSHIP_ID);
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
