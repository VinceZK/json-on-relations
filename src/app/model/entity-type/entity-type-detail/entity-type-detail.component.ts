import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {switchMap} from 'rxjs/operators';
import {EntityService} from '../../../entity.service';
import {EntityMeta} from '../../../entity';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MessageService} from 'ui-message-angular';
import {msgStore} from '../../../msgStore';
import {of} from 'rxjs';

@Component({
  selector: 'app-entity-type-detail',
  templateUrl: './entity-type-detail.component.html',
  styleUrls: ['./entity-type-detail.component.css']
})
export class EntityTypeDetailComponent implements OnInit {
  entityMeta: EntityMeta;
  readonly = true;
  isNewMode = false;
  entityTypeForm: FormGroup;
  changedEntityType = {};

  constructor(private route: ActivatedRoute,
              private fb: FormBuilder,
              private messageService: MessageService,
              private entityService: EntityService) {
    this.messageService.setMessageStore(msgStore, 'EN');
  }

  get attrFormArray() {
    return this.entityTypeForm.get('ATTRIBUTES') as FormArray;
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
          entityType.ATTRIBUTES = [];
          entityType.ROLES = [];
          this.isNewMode = true;
          this.readonly = false;
          return of(entityType);
        } else {
          this.readonly = true;
          this.isNewMode = false;
          return this.entityService.getEntityMeta(params.get('entityID'));
        }
      })
    ).subscribe(data => {
      this.entityMeta = data;
      this._generateEntityTypeForm();
      console.log('Entity Meta:', this.entityMeta);
    });
  }

  _generateEntityTypeForm(): void {
    this.entityTypeForm = this.fb.group({});
    this.entityTypeForm.addControl('ENTITY_ID', new FormControl(this.entityMeta.ENTITY_ID, this._validateEntityId));
    this.entityTypeForm.addControl('ENTITY_DESC', new FormControl(this.entityMeta.ENTITY_DESC));

    // Compose attributes
    let formArray = [];
    this.entityMeta.ATTRIBUTES.forEach( attribute => {
      formArray.push(this.fb.group({
        ATTR_GUID: [attribute.ATTR_GUID],
        RELATION_ID: [attribute.RELATION_ID],
        ATTR_NAME: [attribute.ATTR_NAME],
        ATTR_DESC: [attribute.ATTR_DESC],
        DATA_ELEMENT: [attribute.DATA_ELEMENT],
        DATA_TYPE: [{value: attribute.DATA_TYPE, disabled: this.readonly}],
        DATA_LENGTH: [attribute.DATA_LENGTH],
        PRIMARY_KEY: [attribute.PRIMARY_KEY],
        SEARCHABLE: [{value: attribute.SEARCHABLE, disabled: this.readonly}],
        NOT_NULL: [{value: attribute.NOT_NULL, disabled: this.readonly}],
        UNIQUE: [{value: attribute.UNIQUE, disabled: this.readonly}],
        AUTO_INCREMENT: [{value: attribute.AUTO_INCREMENT, disabled: this.readonly}],
        IS_MULTI_VALUE: [{value: attribute.IS_MULTI_VALUE, disabled: this.readonly}]
      }));
    });
    if (this.isNewMode) {
      formArray.push(this.fb.group({
        ATTR_GUID: [''],
        RELATION_ID: [this.entityMeta.ENTITY_ID],
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
    this.entityTypeForm.addControl('ATTRIBUTES', new FormArray(formArray));

    // Compose roles
    formArray = [];
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
      // return {message:
      //   this.messageService.generateMessage('MODEL', 'ENTITY_ID_MANDATORY', 'E').msgShortText};
    }

    if (c.value.toString().toLowerCase() === 'new') {
      return {message: '"NEW/new" is reserved, thus is not allowed to use!'};
      // return {message:
      //   this.messageService.generateMessage('MODEL', 'ENTITY_ID_NOT_NEW', 'E').msgShortText};
    }

    return null;
  }

  switchEditDisplay() {
    this.readonly = !this.readonly;

    if (!this.readonly) { // Edit Mode
      this.attrFormArray.controls.forEach(attrFormGroup => {
        attrFormGroup.get('DATA_TYPE').enable();
        attrFormGroup.get('PRIMARY_KEY').enable();
        attrFormGroup.get('SEARCHABLE').enable();
        attrFormGroup.get('NOT_NULL').enable();
        attrFormGroup.get('UNIQUE').enable();
        attrFormGroup.get('AUTO_INCREMENT').enable();
        attrFormGroup.get('IS_MULTI_VALUE').enable();
      });
      this.attrFormArray.push(this.fb.group({
        ATTR_GUID: [''],
        RELATION_ID: [this.entityMeta.ENTITY_ID],
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

      this.roleFormArray.push(
        this.fb.group({
          ROLE_ID: [''],
          ROLE_DESC: ['']
        })
      );
    } else { // Display Mode
      let lastIndex = this.attrFormArray.length - 1;
      while (lastIndex >= 0 && this.attrFormArray.controls[lastIndex].get('ATTR_NAME').value.trim() === '') {
          this.attrFormArray.removeAt(lastIndex);
          lastIndex--;
      }
      this.attrFormArray.controls.forEach(attrFormGroup => {
        attrFormGroup.get('DATA_TYPE').disable();
        attrFormGroup.get('PRIMARY_KEY').disable();
        attrFormGroup.get('SEARCHABLE').disable();
        attrFormGroup.get('NOT_NULL').disable();
        attrFormGroup.get('UNIQUE').disable();
        attrFormGroup.get('AUTO_INCREMENT').disable();
        attrFormGroup.get('IS_MULTI_VALUE').disable();
      });

     lastIndex = this.roleFormArray.length - 1;
      while (lastIndex >= 0 && this.roleFormArray.controls[lastIndex].get('ROLE_ID').value.trim() === '') {
        this.roleFormArray.removeAt(lastIndex);
        lastIndex--;
      }
    }
  }

  deleteRole(index: number): void {
    if (index !== this.roleFormArray.length - 1) {
      this.roleFormArray.removeAt(index);
      this.roleFormArray.markAsDirty();
    }
  }

  onChangeRoleID(index: number): void {
    // TODO: get role description
    if (index === this.roleFormArray.length - 1 && this.roleFormArray.controls[index].value.ROLE_ID.trim() !== '') {
      // Only work for the last New line
      this.roleFormArray.push(
        this.fb.group({
          ROLE_ID: [''],
          ROLE_DESC: ['']
        })
      );
    }
  }

  oldRole(formGroup: FormGroup): boolean {
    return this.entityMeta.ROLES.findIndex( role => role.ROLE_ID === formGroup.get('ROLE_ID').value ) !== -1;
  }

  save(): void {
    console.log(this.entityTypeForm);
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

    this._processChangedAttributes();

    this._processChangedRoles();

    console.log(this.changedEntityType);
    // this.entityService.saveEntityType(this.changedEntityType)
    //   .subscribe(data => this._postActivityAfterSavingEntityType(data));
  }

  _processChangedAttributes() {
    const changedAttributes = [];
    let changedAttribute;
    if (this.attrFormArray.dirty) {
      this.changedEntityType['ATTRIBUTES'] = changedAttributes;
      this.attrFormArray.controls.forEach(attribute => {
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
          } else {  // New Add Case
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
      this.entityMeta.ATTRIBUTES.forEach(attribute => {
        const index = this.attrFormArray.controls.findIndex(
          attributeControl => attributeControl.get('ATTR_GUID').value === attribute.ATTR_GUID);
        if (index === -1) { // The attribute must be deleted
          changedAttribute = {action: 'delete', ATTR_GUID: attribute.ATTR_GUID};
          changedAttributes.push(changedAttribute);
        }
      });
    }
  }

  _processChangedRoles(): void {
    const changedRoles = [];
    if (this.roleFormArray.dirty) {
      this.changedEntityType['ROLES'] = changedRoles;

      // New Add Case
      this.roleFormArray.controls.forEach(role => {
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
    if (data['ENTITY_ID']) {
      console.log('returned data', data);
      this.readonly = true;
      this.entityMeta = data;
      this.changedEntityType = {};
      this._generateEntityTypeForm();
      this.entityTypeForm.reset(this.entityTypeForm.value);
      this.messageService.reportMessage('MODEL', 'ENTITY_TYPE_SAVED', 'S', this.entityMeta.ENTITY_ID);
    } else {
      if (data instanceof Array) {
        data.forEach(err => this.messageService.add(err));
      } else {
        this.messageService.report(data);
      }
    }
  }
}
