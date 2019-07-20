import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {switchMap} from 'rxjs/operators';
import {EntityService} from 'jor-angular';
import {Attribute, EntityMeta} from 'jor-angular';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {Message, MessageService} from 'ui-message-angular';
import {msgStore} from '../../../msgStore';
import {forkJoin, Observable, of} from 'rxjs';
import {AttributeMetaComponent} from '../../attribute-meta/attribute-meta.component';
import {ModelService} from '../../model.service';
import {DialogService} from '../../../dialog.service';
import {UniqueEntityTypeValidator} from '../../model-validators';
import {SearchHelpComponent} from 'jor-angular';
import {SearchHelpMethod, SearchHelp} from 'jor-angular';

@Component({
  selector: 'app-entity-type-detail',
  templateUrl: './entity-type-detail.component.html',
  styleUrls: ['./entity-type-detail.component.css']
})
export class EntityTypeDetailComponent implements OnInit {
  entityMeta: EntityMeta;
  attributes: Attribute[];
  readonly = true;
  isNewMode = false;
  entityTypeForm: FormGroup;
  changedEntityType = {};
  bypassProtection = false;
  isSearchListShown = true;

  @ViewChild(AttributeMetaComponent)
  private attrComponent: AttributeMetaComponent;
  @ViewChild(SearchHelpComponent)
  private searchHelpComponent: SearchHelpComponent;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private fb: FormBuilder,
              private uniqueEntityTypeValidator: UniqueEntityTypeValidator,
              private messageService: MessageService,
              private modelService: ModelService,
              private dialogService: DialogService,
              private entityService: EntityService) {
    this.messageService.setMessageStore(msgStore, 'EN');
  }

  get roleFormArray() {
    return this.entityTypeForm.get('ROLES') as FormArray;
  }

  get attrFormArray() {
    return this.entityTypeForm.get('ATTRIBUTES') as FormArray;
  }

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        const entityID = params.get('entityID');
        if (entityID === 'new') {
          const entityType = new EntityMeta();
          entityType.ENTITY_ID = '';
          entityType.ENTITY_DESC = '';
          entityType.ROLES = [];
          this.isNewMode = true;
          this.readonly = false;
          this.bypassProtection = false;
          return forkJoin(of(entityType), of([]));
        } else {
          this.readonly = true;
          this.isNewMode = false;
          return forkJoin(
            this.entityService.getEntityMeta(entityID),
            this.entityService.getRelationMeta(entityID));
        }
      })
    ).subscribe(data => {
      if ( 'ENTITY_ID' in data[0]) {
        this.messageService.clearMessages();
        this.entityMeta = <EntityMeta>data[0];
        this.attributes = 'RELATION_ID' in data[1] ? data[1]['ATTRIBUTES'] : [];
        this._generateEntityTypeForm();
      } else {
        this.messageService.clearMessages();
        this.entityMeta = null;
        this.entityTypeForm = null;
        if (data[0] instanceof Array) {
          data[0].forEach(err => this.messageService.add(err) );
        } else {
          this.messageService.report(<Message>data[0]);
        }
      }
    });

    this.modelService.isSearchListShown$.subscribe( data => this.isSearchListShown = data);
  }

  showSearchList(): void {
    this.isSearchListShown = true;
    this.modelService.showSearchList();
  }

  onSearchHelp(fieldName: string, control: AbstractControl, rowID: number): void {
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
    searchHelpMeta.READ_ONLY = this.readonly || this.oldRole(control) && control.valid;

    const afterExportFn = function (context: any, ruleIdx: number) {
      return () => context.onChangeRoleID(ruleIdx, true);
    }(this, rowID).bind(this);
    this.searchHelpComponent.openSearchHelpModal(searchHelpMeta, control, afterExportFn);
  }

  _generateEntityTypeForm(): void {
    this.entityTypeForm = this.fb.group({});
    this.entityTypeForm.addControl('ENTITY_ID',
      new FormControl(this.entityMeta.ENTITY_ID, {updateOn: 'blur'}));
    if (this.isNewMode) {
      this.entityTypeForm.get('ENTITY_ID').setValidators(this._validateEntityId);
      this.entityTypeForm.get('ENTITY_ID').setAsyncValidators(
        this.uniqueEntityTypeValidator.validate.bind(this.uniqueEntityTypeValidator));
    }
    this.entityTypeForm.addControl('ENTITY_DESC', new FormControl(this.entityMeta.ENTITY_DESC));

    // Compose roles
    const formArray = [];
    this.entityMeta.ROLES.forEach( role => {
      formArray.push(this.fb.group({
        ROLE_ID: [role.ROLE_ID],
        ROLE_DESC: [role.ROLE_DESC],
        CONDITIONAL_ATTR: [{value: role.CONDITIONAL_ATTR, disabled: this.readonly}],
        CONDITIONAL_VALUE: [role.CONDITIONAL_VALUE]
      }));
    });
    if (this.isNewMode) {
      formArray.push(
        this.fb.group({
          ROLE_ID: [''],
          ROLE_DESC: [''],
          CONDITIONAL_ATTR: [''],
          CONDITIONAL_VALUE: ['']
        }));
    }
    this.entityTypeForm.addControl('ROLES', new FormArray(formArray));
  }

  _validateEntityId(c: FormControl) {
    if (c.value.trim() === '') {
      return {message: 'Entity ID is mandatory'};
    }

    if (c.value.toString().toLowerCase() === 'new') {
      return {message: '"NEW/new" is reserved, thus is not allowed to use!'};
    }

    if (c.value.toString().toLowerCase().substr(0, 2) === 'r_' ||
        c.value.toString().toLowerCase().substr(0, 3) === 'rs_') {
      return {message: 'Entity ID cannot be started with "r_" or "rs_"!'};
    }
    return null;
  }

  switchEditDisplay() {
    if (this.isNewMode) {
      this.dialogService.confirm('Discard the new Entity Type?').subscribe(confirm => {
        if (confirm) {
          this._switch2DisplayMode();
          this.entityMeta = null;
          this.modelService.sendDialogAnswer('OK');
        } else {
          this.modelService.sendDialogAnswer('CANCEL');
        }
      });
      return;
    }

    if (!this.readonly) { // In Change Mode -> Display Mode
      if (this.entityTypeForm.dirty) {
        this.dialogService.confirm('Discard changes?').subscribe(confirm => {
          if (confirm) { // Discard changes and switch to Display Mode
            this._generateEntityTypeForm();
            this.entityTypeForm.reset(this.entityTypeForm.value);
            this._switch2DisplayMode();
          }
        });
      } else { // Switch to display mode
        this._switch2DisplayMode();
      }
    } else { // In Display Mode -> Change Mode
      this.readonly = false;
      this.attrComponent.switchEditDisplay(this.readonly);
      this.roleFormArray.controls.forEach(roleFormGroup => roleFormGroup.get('CONDITIONAL_ATTR').enable());
      this.roleFormArray.push(
        this.fb.group({
          ROLE_ID: [''],
          ROLE_DESC: [''],
          CONDITIONAL_ATTR: [''],
          CONDITIONAL_VALUE: ['']
        })
      );
    }
  }

  _switch2DisplayMode(): void {
    this.readonly = true;
    this.attrComponent.switchEditDisplay(this.readonly);
    this.roleFormArray.controls.forEach(roleFormGroup => {
      roleFormGroup.get('CONDITIONAL_ATTR').disable();
    });
    let lastIndex = this.roleFormArray.length - 1;
    while (lastIndex >= 0 && this.roleFormArray.controls[lastIndex].get('ROLE_ID').value.trim() === '') {
      this.roleFormArray.removeAt(lastIndex);
      lastIndex--;
    }
  }

  onChangeEntityID(): void {
    this.modelService.updateEntityID(this.entityTypeForm.get('ENTITY_ID').value);
  }

  onChangeEntityDesc(): void {
    this.modelService.updateEntityDesc(this.entityTypeForm.get('ENTITY_DESC').value);
  }

  deleteRole(index: number): void {
    if (index !== this.roleFormArray.length - 1) {
      this.roleFormArray.removeAt(index);
      this.roleFormArray.markAsDirty();
    }
  }

  onChangeRoleID(index: number, isExportedFromSH?: boolean): void {
    const currentRoleFormGroup = this.roleFormArray.controls[index];
    if (this.roleFormArray.controls.findIndex((roleCtrl, i) =>
      i !== index && roleCtrl.get('ROLE_ID').value === currentRoleFormGroup.get('ROLE_ID').value
    ) !== -1) {
      currentRoleFormGroup.get('ROLE_ID').setErrors({message: 'Duplicate roles'});
      return;
    }

    if (index === this.roleFormArray.length - 1 && currentRoleFormGroup.value.ROLE_ID.trim() !== '') {
      // Only work for the last New line
      this.roleFormArray.push(
        this.fb.group({
          ROLE_ID: [''],
          ROLE_DESC: [''],
          CONDITIONAL_ATTR: [''],
          CONDITIONAL_VALUE: ['']
        })
      );
    }

    if (!isExportedFromSH) {
      this.entityService.getRoleDesc(currentRoleFormGroup.value.ROLE_ID).subscribe(data => {
        if (data['msgCat']) {
          currentRoleFormGroup.get('ROLE_ID').setErrors({message: data['msgShortText']});
        } else {
          currentRoleFormGroup.get('ROLE_DESC').setValue(data);
        }
      });
    }
  }

  oldRole(formGroup: AbstractControl): boolean {
    return this.entityMeta.ROLES ?
      this.entityMeta.ROLES.findIndex(
        role => role.ROLE_ID === formGroup.get('ROLE_ID').value ) !== -1 :
      false;
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.isNewMode || (!this.bypassProtection && this.entityTypeForm && this.entityTypeForm.dirty)) {
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
    if (!this.entityTypeForm.dirty) {
      return this.messageService.reportMessage('MODEL', 'NO_CHANGE', 'S');
    }

    if (!this.entityTypeForm.valid) {
      return this.messageService.reportMessage('MODEL', 'INVALID_DATA', 'E');
    }

    if (this.isNewMode) {
      this.changedEntityType['action'] = 'add';
      this.changedEntityType['ENTITY_ID'] = this.entityTypeForm.controls['ENTITY_ID'].value;
    } else {
      this.changedEntityType['action'] = 'update';
      this.changedEntityType['ENTITY_ID'] = this.entityMeta.ENTITY_ID;
    }
    if (this.entityTypeForm.controls['ENTITY_DESC'].dirty) {
      this.changedEntityType['ENTITY_DESC'] = this.entityTypeForm.controls['ENTITY_DESC'].value;
    }

    this.changedEntityType['ATTRIBUTES'] = this.attrComponent.processChangedAttributes();
    this._processChangedRoles();

    this.entityService.saveEntityType(this.changedEntityType)
      .subscribe(data => this._postActivityAfterSavingEntityType(data));
  }

  _processChangedRoles(): void {
    const changedRoles = [];
    if (this.roleFormArray.dirty) {
      this.changedEntityType['ROLES'] = changedRoles;
      let action;
      // Add/Update Case
      this.roleFormArray.controls.forEach(role => {
        if (role.get('ROLE_ID').value.trim() === '') { return; }
        const index = this.entityMeta.ROLES.findIndex(
          existRole => role.value.ROLE_ID === existRole.ROLE_ID);
        action = index === -1 ? 'add' : 'update';
        if (role.dirty) {
          const changedRole = { action: action, ROLE_ID: role.value.ROLE_ID };
          if (role.get('CONDITIONAL_ATTR').dirty) {
            changedRole['CONDITIONAL_ATTR'] = role.value.CONDITIONAL_ATTR;
          }
          if (role.get('CONDITIONAL_VALUE').dirty) {
            changedRole['CONDITIONAL_VALUE'] = role.value.CONDITIONAL_VALUE;
          }
          changedRoles.push(changedRole);
        }
      });

      // Deletion Case
      this.entityMeta.ROLES.forEach(role => {
        const index = this.roleFormArray.controls.findIndex(
          roleControl => roleControl.get('ROLE_ID').value === role.ROLE_ID);
        if (index === -1) {
          const deletedRole = {action: 'delete', ROLE_ID: role.ROLE_ID};
          changedRoles.push(deletedRole);
        }
      });
    }
  }

  _postActivityAfterSavingEntityType(data: any) {
    if (data[0] && data[0]['ENTITY_ID']) {
      if (this.isNewMode) {
        this.isNewMode = false;
        this.bypassProtection = true;
        this.router.navigate(['/model/entity-type/' + data[0]['ENTITY_ID']]);
      } else {
        this.readonly = true;
        this.entityMeta = data[0];
        this.attributes = data[1].ATTRIBUTES;
        this.changedEntityType = {};
        this._generateEntityTypeForm();
        this.messageService.reportMessage('MODEL', 'ENTITY_TYPE_SAVED', 'S',
          this.entityMeta.ENTITY_ID);
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
