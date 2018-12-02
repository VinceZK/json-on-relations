import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {switchMap} from 'rxjs/operators';
import {EntityService} from '../../../entity.service';
import {Attribute, EntityMeta} from '../../../entity';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {Message, MessageService} from 'ui-message-angular';
import {msgStore} from '../../../msgStore';
import {forkJoin, Observable, of} from 'rxjs';
import {AttributeMetaComponent} from '../../attribute-meta/attribute-meta.component';
import {ModelService} from '../../model.service';
import {DialogService} from '../../../dialog.service';
import {UniqueEntityTypeValidator} from '../../model-validators';

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

  @ViewChild(AttributeMetaComponent)
  private attrComponent: AttributeMetaComponent;

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
          return forkJoin(of(entityType), of([]));
        } else {
          this.readonly = true;
          this.isNewMode = false;
          return forkJoin(
            this.entityService.getEntityMeta(params.get('entityID')),
            this.entityService.getRelationMeta(params.get('entityID')));
        }
      })
    ).subscribe(data => {
      if ( 'msgName' in data[0]) {
        this.messageService.clearMessages();
        this.entityMeta = null;
        this.entityTypeForm = null;
        this.messageService.report(<Message>data[0]);
      } else {
        this.messageService.clearMessages();
        this.entityMeta = data[0];
        this.attributes = 'msgName' in data[1] ? [] : data[1].ATTRIBUTES;
        this._generateEntityTypeForm();
      }
    });
  }

  _generateEntityTypeForm(): void {
    this.entityTypeForm = this.fb.group({});
    this.entityTypeForm.addControl('ENTITY_ID', new FormControl(this.entityMeta.ENTITY_ID, {updateOn: 'blur'}));
    if (this.isNewMode) {
      this.entityTypeForm.get('ENTITY_ID').setValidators(this._validateEntityId);
      this.entityTypeForm.get('ENTITY_ID').setAsyncValidators(this.uniqueEntityTypeValidator.validate.bind(this.uniqueEntityTypeValidator));
    }
    this.entityTypeForm.addControl('ENTITY_DESC', new FormControl(this.entityMeta.ENTITY_DESC));

    // Compose roles
    const formArray = [];
    this.entityMeta.ROLES.forEach( role => {
      formArray.push(this.fb.group({
        ROLE_ID: [role.ROLE_ID],
        ROLE_DESC: [role.ROLE_DESC],
      }));
    });
    if (this.isNewMode) {
      formArray.push(
        this.fb.group({
          ROLE_ID: [''],
          ROLE_DESC: ['']
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
      this.roleFormArray.push(
        this.fb.group({
          ROLE_ID: [''],
          ROLE_DESC: ['']
        })
      );
    }
  }

  _switch2DisplayMode(): void {
    this.readonly = true;
    this.attrComponent.switchEditDisplay(this.readonly);
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

  onChangeRoleID(index: number): void {
    if (index === this.roleFormArray.length - 1 && this.roleFormArray.controls[index].value.ROLE_ID.trim() !== '') {
      // Only work for the last New line
      this.roleFormArray.push(
        this.fb.group({
          ROLE_ID: [''],
          ROLE_DESC: ['']
        })
      );
    }

    this.entityService.getRoleDesc(this.roleFormArray.controls[index].value.ROLE_ID).subscribe(data => {
      if (data['msgCat']) {
        this.roleFormArray.controls[index].get('ROLE_ID').setErrors({message: data['msgShortText']});
      } else {
        this.roleFormArray.controls[index].get('ROLE_DESC').setValue(data);
      }
    });
  }

  oldRole(formGroup: FormGroup): boolean {
    return this.entityMeta.ROLES.findIndex( role => role.ROLE_ID === formGroup.get('ROLE_ID').value ) !== -1;
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.isNewMode || (this.entityTypeForm && this.entityTypeForm.dirty)) {
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

      // New Add Case
      this.roleFormArray.controls.forEach(role => {
        if (role.get('ROLE_ID').value.trim() === '') { return; }
        if (role.dirty) {
          const newAddedRole = { action: 'add', ROLE_ID: role.value.ROLE_ID };
          changedRoles.push(newAddedRole);
        }
      });

      // Deletion Case
      this.entityMeta.ROLES.forEach(role => {
        const index = this.roleFormArray.controls.findIndex(
          roleControl => roleControl.get('ROLE_ID').value === role.ROLE_ID);
        if (index === -1) { // The attribute must be deleted
          const deletedRole = {action: 'delete', ROLE_ID: role.ROLE_ID};
          changedRoles.push(deletedRole);
        }
      });
    }
  }

  _postActivityAfterSavingEntityType(data: any) {
    if (data[0] && data[0]['ENTITY_ID']) {
      if (this.isNewMode) {
        this.entityTypeForm.reset(this.entityTypeForm.value);
        this.router.navigate(['/model/entity-type/' + data[0]['ENTITY_ID']]);
      } else {
        this.readonly = true;
        this.entityMeta = data[0];
        this.attributes = data[1].ATTRIBUTES;
        this.changedEntityType = {};
        this._generateEntityTypeForm();
        this.entityTypeForm.reset(this.entityTypeForm.value);
        this.messageService.reportMessage('MODEL', 'ENTITY_TYPE_SAVED', 'S', this.entityMeta.ENTITY_ID);
      }
    } else {
      if (data instanceof Array) {
        data.forEach(err => this.messageService.add(err));
      } else {
        this.messageService.report(data);
      }
    }
  }
}
