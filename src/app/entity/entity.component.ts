import { Component, OnInit } from '@angular/core';
import {Attribute, Entity, EntityMeta, EntityRelation, RelationMeta, Role, Relationship,
   RelationshipInstance, RelationshipMeta, EntityService, AttributeControlService} from 'jor-angular';
import {forkJoin, Observable, of} from 'rxjs';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {Message, MessageService} from 'ui-message-angular';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {switchMap} from 'rxjs/operators';
import {DialogService} from '../dialog.service';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-entity',
  templateUrl: './entity.component.html',
  styleUrls: ['./entity.component.css']
})
export class EntityComponent implements OnInit {
  entityMeta: EntityMeta;
  entity: Entity;
  changedEntity: Entity;
  relationMetas: RelationMeta[];
  entityRelations: EntityRelation[];
  formGroup: FormGroup;
  readonly = true;
  isRelationshipModalShown = false;
  isEntityJSONModalShown = false;
  toBeAddRelationship: Relationship;
  showDeletionConfirmation = false;

  constructor(private fb: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private attributeControlService: AttributeControlService,
              private messageService: MessageService,
              private dialogService: DialogService,
              private entityService: EntityService) {
    this.formGroup = this.fb.group({});
    this.toBeAddRelationship = new Relationship();
  }

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        const action = params.get('action');
        this.entityMeta = null;
        if (action === 'new') {
          this.readonly = false;
          this.entity = new Entity();
          this.entity.ENTITY_ID = params.get('entityID');
          this.entity.relationships = [];
          return of(this.entity);
        } else if (action === 'copy') {
          this.readonly = false;
          if (!this.entity) {
            this.entity = new Entity();
            this.entity.ENTITY_ID = params.get('entityID');
            this.entity.relationships = [];
          }
          return of(this.entity);
        } else if (action === 'change') {
          this.readonly = false;
          return this.entityService.getEntityInstance(params.get('instanceGUID'));
        } else {
          this.readonly = true;
          return this.entityService.getEntityInstance(params.get('instanceGUID'));
        }
      }),
      switchMap(data => {
        let entityMeta$ = of({});
        let relationMetas$ = of([]);
        let errMessages$ = of([]);
        // console.log(data);
        if (data['ENTITY_ID']) {
          this.entity = data as Entity;
          entityMeta$ = this.entityService.getEntityMeta(this.entity.ENTITY_ID);
          relationMetas$ = this.entityService.getRelationMetaOfEntity(this.entity.ENTITY_ID);
        } else {
          errMessages$ = of(<any[]>data);
        }
        return forkJoin([entityMeta$, relationMetas$, errMessages$]);
      })
    ).subscribe(data => {
        if (data[2].length > 0) {
          data[2].forEach(err => this.messageService.add(err as Message));
        } else {
          this.entityMeta = <EntityMeta>data[0];
          this.relationMetas = <RelationMeta[]>data[1];
          this._createFormFromMeta();
        }
        this.messageService.clearMessages();
    });

  }

  get displayRelationshipModal() {return this.isRelationshipModalShown ? 'block' : 'none'; }
  get displayEntityJSONModal() {return this.isEntityJSONModalShown ? 'block' : 'none'; }
  get enabledEntityRoles() {return this.entityMeta.ROLES.filter( role => {
    if (role.CONDITIONAL_ATTR && role.CONDITIONAL_VALUE) {
      const conditionalValues = role.CONDITIONAL_VALUE.split(`,`);
      return conditionalValues.includes(this.formGroup.get([this.entityMeta.ENTITY_ID, role.CONDITIONAL_ATTR]).value);
    } else {
      return true;
    }});
  }
  get enabledEntityRelationships() {return this.entity.relationships.filter( relationship => {
    const role = this.entityMeta.ROLES.find( roleMeta => roleMeta.ROLE_ID === relationship.SELF_ROLE_ID);
    if (role.CONDITIONAL_ATTR && role.CONDITIONAL_VALUE) {
      const conditionalValues = role.CONDITIONAL_VALUE.split(`,`);
      return conditionalValues.includes(this.formGroup.get([this.entityMeta.ENTITY_ID, role.CONDITIONAL_ATTR]).value);
    } else {
      return true;
    }});
  }
  get entityAttributes() {return this.relationMetas.find(
    relationMeta => relationMeta.RELATION_ID === this.entity.ENTITY_ID).ATTRIBUTES; }
  get displayDeletionConfirmation() {return this.showDeletionConfirmation ? 'block' : 'none'; }

  toggleEditDisplay(): void {
    if (this.readonly ) {
      this._switch2EditMode();
    } else {
      if (this.formGroup.dirty) {
        this.router.navigate(['entity', this.entity.INSTANCE_GUID, {action: 'display', navID: uuid()}]);
      } else {
        this._switch2DisplayMode();
      }
    }
    this.messageService.clearMessages();
  }

  _switch2EditMode(): void {
    this.readonly = false;
    window.history.replaceState({}, '', `/entity/${this.entity.INSTANCE_GUID};action=change`);
  }

  _switch2DisplayMode(): void {
    this.readonly = true;
    this.formGroup.markAsPristine();
    window.history.replaceState({}, '', `/entity/${this.entity.INSTANCE_GUID};action=display`);
  }

  saveEntity(): void {
    this.messageService.clearMessages();
    if (!this._composeChangedEntity()) {
      return;
    }

    if (this.entity.INSTANCE_GUID) {
      this.entityService.changeEntityInstance(this.changedEntity).subscribe(data => {
        this._postActivityAfterSaving(data);
      });
    } else {
      this.entityService.createEntityInstance(this.changedEntity).subscribe(data => {
        this._postActivityAfterSaving(data);
      });
    }
    window.scroll(0, 0);
  }

  newEntity(): void {
    this.router.navigate(['/entity/new', {entityID: this.entityMeta.ENTITY_ID, action: 'new', navID: uuid()}]);
  }

  copyEntity(): void {
    delete this.entity.INSTANCE_GUID;
    this.relationMetas.forEach( relationMeta => {
      if (relationMeta.RELATION_ID.substr(0, 2) !== 'r_' || !this.entity[relationMeta.RELATION_ID]) { return; }
      this.entity[relationMeta.RELATION_ID].forEach( relationValue => {
        relationMeta.ATTRIBUTES.forEach( attribute => {
          if (attribute.PRIMARY_KEY || attribute.AUTO_INCREMENT) {
            relationValue[attribute.ATTR_NAME] = '';
          }
        });
      });
    });

    let index;
    do { // Delete relationships that have partner cardinality equals [1..1]
      index = this.entity.relationships.findIndex( relationship => {
        const relationshipMeta = this.getRelationshipMeta(relationship.RELATIONSHIP_ID);
        const idx = relationshipMeta.INVOLVES.findIndex(
          involve => involve.CARDINALITY === '[1..1]' && involve.ROLE_ID !== relationship.SELF_ROLE_ID );
        return idx > -1;
      });
      if (index > -1) { this.entity.relationships.splice(index, 1); }
    } while ( index > -1);

    this.entity.relationships.forEach( relationship => {
      relationship.values.forEach( value => {
        value.action = 'add';
        value.RELATIONSHIP_INSTANCE_GUID = this.entityService.generateFakeRelationshipUUID();
      });
    });

    this.router.navigate(['/entity/new', {entityID: this.entityMeta.ENTITY_ID, action: 'copy', navID: uuid()}]);
  }

  deleteEntity(): void {
    this.showDeletionConfirmation = true;
  }

  cancelDeletion(): void {
    this.showDeletionConfirmation = false;
  }

  confirmDeletion(): void {
    this.entityService.deleteEntityInstance(this.entity.INSTANCE_GUID).subscribe( errorMsg => {
      this.showDeletionConfirmation = false;
      if (errorMsg) {
        const messages = <Message[]>errorMsg;
        messages.forEach( msg => this.messageService.add(msg));
      } else {
        this.messageService.reportMessage('ENTITY', 'ENTITY_DELETED', 'S');
        this.router.navigate(['/entity/list', {action: 'refresh', navID: uuid()}]);
      }
    });
  }

  return2List(): void {
    this.router.navigate(['/entity/list', {action: 'refresh', navID: uuid()}]);
  }
  openAddRelationshipModal(): void {
    this.messageService.clearMessages();
    this.toBeAddRelationship = new Relationship();
    this.isRelationshipModalShown = true;
  }

  closeAddRelationshipModal(): void {
    this.isRelationshipModalShown = false;
  }

  openEntityJSONModal(): void {
    this.isEntityJSONModalShown = true;
  }

  closeEntityJSONModal(): void {
    this.isEntityJSONModalShown = false;
  }

  clearRelationshipID(): void {
    delete this.toBeAddRelationship.RELATIONSHIP_ID;
  }

  addRelationship(): void {
    if (!this.toBeAddRelationship.RELATIONSHIP_ID) {
      this.messageService.reportMessage('RELATIONSHIP', 'RELATIONSHIP_MANDATORY', 'E');
      return;
    }
    if (!this.entity.relationships) { this.entity.relationships = []; }
    const index = this.entity.relationships.findIndex(
      relationship => relationship.RELATIONSHIP_ID === this.toBeAddRelationship.RELATIONSHIP_ID);
    if (index !== -1) {
      this.messageService.reportMessage(
        'RELATIONSHIP', 'RELATIONSHIP_ALREADY_EXISTS', 'E', this.toBeAddRelationship.RELATIONSHIP_ID);
    } else {
      this.entity.relationships.push(this.toBeAddRelationship);
      this.isRelationshipModalShown = false;
    }
  }

  getRelationshipsMeta(roleID: string): RelationshipMeta[] {
    const roleMeta = this.entityMeta.ROLES.find(role => role.ROLE_ID === roleID);
    return roleMeta ? roleMeta.RELATIONSHIPS : [];
  }

  getRelationshipMeta(relationshipID: string): RelationshipMeta {
    let relationshipIndex = -1;
    const roleIndex = this.entityMeta.ROLES.findIndex( role => {
      relationshipIndex =
        role.RELATIONSHIPS.findIndex(relationship => relationship.RELATIONSHIP_ID === relationshipID);
      if (relationshipIndex !== -1) {
        return true;
      }
    });

    return this.entityMeta.ROLES[roleIndex].RELATIONSHIPS[relationshipIndex];
  }

  getRelationshipAttributes(relationshipID: string): RelationMeta {
    return this.relationMetas.find(
      relationMeta => relationshipID === relationMeta.RELATION_ID
    );
  }

  _composeChangedEntity(): boolean {
    if (this.formGroup.dirty === false && this.entity.INSTANCE_GUID) {
      this.messageService.reportMessage('ENTITY', 'NO_CHANGE', 'W');
      return false; // Nothing is changed
    }

    if (!this.formGroup.valid) {
      this.messageService.reportMessage('ENTITY', 'HAS_ERRORS', 'E');
      return false;
    }

    this.changedEntity = new Entity();
    this.changedEntity.ENTITY_ID = this.entity.ENTITY_ID;
    this.changedEntity.INSTANCE_GUID = this.entity.INSTANCE_GUID;

    Object.keys(this.formGroup.controls).forEach(key => {
      const control = this.formGroup.controls[key];

      if (control instanceof FormControl && control.dirty === true) {
        this._composeChangedPropertyValue(key, control);
      } else if (control instanceof FormGroup && control.dirty === true) {
        this.entity.INSTANCE_GUID ? this._composeChangedSingleValueRelation(key, control.controls) :
                                    this._composeNewSingleValueRelation(key, control.controls);
      } else if (control instanceof FormArray && control.dirty === true) {
        this.entity.INSTANCE_GUID ? this._composeChangedMultiValueRelation(key, control.controls) :
                                    this._composeNewMultiValueRelation(key, control.controls);
      }
    });

    if (!this.entity.relationships) { return true; }
    const changedRelationships = [];
    this.entity.relationships.forEach(relationship => {
      if (!relationship.values) { return; }
      const changedRelationship = new Relationship();
      changedRelationship.RELATIONSHIP_ID = relationship.RELATIONSHIP_ID;
      changedRelationship.SELF_ROLE_ID = relationship.SELF_ROLE_ID;
      changedRelationship.values = [];
      if (!this.entity.INSTANCE_GUID) { // Create a new entity
        relationship.values.forEach( value => {
          if (value.action === 'add' || value.action === 'update' || value.action === 'extend') {
            const copyValue = { ...value } as RelationshipInstance; // Deep clone value
            copyValue.action = 'add';
            changedRelationship.values.push(copyValue);
          }
        });
      } else {
        relationship.values.forEach(value => {
          if (value.action) {
            changedRelationship.values.push(value);
          }
        });
      }
      if ( changedRelationship.values.length > 0 ) {
        changedRelationships.push(changedRelationship);
      }
    });
    if ( changedRelationships.length > 0 ) {
      this.changedEntity.relationships = changedRelationships;
    }

    return true;
  }

  _composeChangedPropertyValue(key, control: FormControl) {
    this.changedEntity[key] = control.value;
  }

  _composeChangedSingleValueRelation(key, attrControls) {
    this.changedEntity[key] = {};
    if (this.entity[key]) { // Relation instance exists before
      this._getPrimaryKeys(key).forEach(primaryKey => {
        this.changedEntity[key][primaryKey.ATTR_NAME] = this.entity[key][0][primaryKey.ATTR_NAME];
      });

      if (Object.keys(attrControls).length === 0) {
        this.changedEntity[key]['action'] = 'delete';
      } else {
        this.changedEntity[key]['action'] = 'update';
      }
    } else { // Relation instance doesn't exist before
      if (Object.keys(attrControls).length !== 0) {
        this.changedEntity[key]['action'] = 'add';
      }
    }

    if (this.changedEntity[key].action === 'update' || this.changedEntity[key].action === 'add') {
      Object.keys(attrControls).forEach(attrName => {
        const attrControl = attrControls[attrName];
        if (attrControl.dirty === true) {
          this.changedEntity[key][attrName] = attrControl.value;
        }
      });
    }
  }

  _composeNewSingleValueRelation(key, attrControls) {
    if (Object.keys(attrControls).length === 0) { return; }
    this.changedEntity[key] = {};
    Object.keys(attrControls).forEach(attrName => {
      const attrControl = attrControls[attrName];
      if (attrControl.dirty === true) {
        this.changedEntity[key][attrName] = attrControl.value;
      }
    });
  }

  _composeChangedMultiValueRelation(key, relationControls) {
    const originalLines = this.entity[key];
    const primaryKeys = this._getPrimaryKeys(key);

    this.changedEntity[key] = [];
    relationControls.forEach(relationFormGroup => {
      const changedLine = {};
      if (relationFormGroup.dirty) {
        const index = originalLines.findIndex( line => {
          let found = false;
          primaryKeys.forEach(primaryKey => {
            found = line[primaryKey.ATTR_NAME] === relationFormGroup.value[primaryKey.ATTR_NAME];
          });
          return found;
        });

        if (index === -1) { // New line
          changedLine['action'] = 'add';
          primaryKeys.forEach( primaryKey => {
            if (!primaryKey.AUTO_INCREMENT) {
              changedLine[primaryKey.ATTR_NAME] = relationFormGroup.value[primaryKey.ATTR_NAME];
            }
          });
        } else {
          changedLine['action'] = 'update';
          primaryKeys.forEach( primaryKey => {
            changedLine[primaryKey.ATTR_NAME] = relationFormGroup.value[primaryKey.ATTR_NAME];
          });
        }

        Object.keys(relationFormGroup.controls).forEach(attrName => {
          const attrControl = relationFormGroup.controls[attrName];
          if (attrControl.dirty === true) {
            changedLine[attrName] = attrControl.value;
          }
        });

        this.changedEntity[key].push(changedLine);
      }
    });

    originalLines.forEach(line => {
      if (Object.keys(line).length === 0) {return; }
      const deleteLine = {action: 'delete'};
      const index = relationControls.findIndex( relationFormGroup => {
        let found = false;
        primaryKeys.forEach(primaryKey => {
          found = line[primaryKey.ATTR_NAME] === relationFormGroup.value[primaryKey.ATTR_NAME];
        });
        return found;
      });

      if (index === -1) { // Original item is not found in the UI
        primaryKeys.forEach(primaryKey => {
          deleteLine[primaryKey.ATTR_NAME] = line[primaryKey.ATTR_NAME];
        });
        this.changedEntity[key].push(deleteLine);
      }

    });
  }

  _composeNewMultiValueRelation(key, relationControls) {
    if (relationControls.length === 0) { return; }

    this.changedEntity[key] = [];
    relationControls.forEach(relationFormGroup => {
      const changedLine = {};
      if (relationFormGroup.dirty) {
        Object.keys(relationFormGroup.controls).forEach(attrName => {
          const attrControl = relationFormGroup.controls[attrName];
          if (attrControl.dirty === true) {
            changedLine[attrName] = attrControl.value;
          }
        });
        this.changedEntity[key].push(changedLine);
      }
    });
  }

  _getPrimaryKeys(relation): Attribute[] {
    return this.entityRelations.find(ele => {
      return ele.RELATION_ID === relation;
    }).ATTRIBUTES.filter( attribute => attribute.PRIMARY_KEY );
  }

  _createFormFromMeta() {
    this.formGroup = this.fb.group({});
    this.entityRelations = this._getEntityRelations();
    const markAsDirty = !this.entity.INSTANCE_GUID;
    this.entityRelations.forEach(relation => {
      switch (relation.CARDINALITY) {
        case '[0..1]':
          if (relation.EMPTY) {
            this.entity[relation.RELATION_ID] = [{}];
            this.formGroup.addControl(relation.RELATION_ID, new FormGroup({}));
          } else {
            this.formGroup.addControl(relation.RELATION_ID,
              this.attributeControlService.convertToFormGroup(relation.ATTRIBUTES, this.entity[relation.RELATION_ID][0], markAsDirty));
          }
          break;
        case '[1..1]':
          if (relation.EMPTY) {
            this.entity[relation.RELATION_ID] = [{}];
            relation.EMPTY = false;
          }
          this.formGroup.addControl(relation.RELATION_ID,
              this.attributeControlService.convertToFormGroup(relation.ATTRIBUTES, this.entity[relation.RELATION_ID][0], markAsDirty));
          break;
        case '[0..n]':
          if (relation.EMPTY) {
            this.entity[relation.RELATION_ID] = [{}];
            this.formGroup.addControl(relation.RELATION_ID, new FormArray([]));
          } else {
            this.formGroup.addControl(relation.RELATION_ID,
              this._convertToFormArray(relation.ATTRIBUTES, this.entity[relation.RELATION_ID]));
          }
          break;
        case '[1..n]':
          if (relation.EMPTY) {
            this.entity[relation.RELATION_ID] = [{}];
            relation.EMPTY = false;
          }
          this.formGroup.addControl(relation.RELATION_ID,
            this._convertToFormArray(relation.ATTRIBUTES, this.entity[relation.RELATION_ID]));
          break;
      }
      // In copy cases, all the relations must be marked as dirty
      if (markAsDirty) { this.formGroup.get(relation.RELATION_ID).markAsDirty(); }
    });
  }

  _getEntityRelations(): EntityRelation[] {
    const entityRelations: EntityRelation[] = [];

    let entityRelation = new EntityRelation;
    entityRelation.ROLE_ID = this.entity.ENTITY_ID;
    entityRelation.RELATION_ID = this.entity.ENTITY_ID;
    entityRelation.CARDINALITY = '[1..1]';
    entityRelation.EMPTY = !this.entity[this.entity.ENTITY_ID];
    entityRelation.DISABLED = false;
    entityRelation.ATTRIBUTES = this.entityAttributes;
    entityRelations.push(entityRelation);

    const relationMetas = this.relationMetas;
    this.entityMeta.ROLES.forEach(role => {
      role.RELATIONS.forEach(relation => {
        entityRelation = new EntityRelation;
        entityRelation.ROLE_ID = role.ROLE_ID;
        entityRelation.CONDITIONAL_ATTR = role.CONDITIONAL_ATTR;
        entityRelation.CONDITIONAL_VALUE = role.CONDITIONAL_VALUE;
        entityRelation.RELATION_ID = relation.RELATION_ID;
        entityRelation.CARDINALITY = relation.CARDINALITY;
        entityRelation.EMPTY = !this.entity[relation.RELATION_ID];
        entityRelation.DISABLED = this._isRelationDisabled(role);
        entityRelation.ATTRIBUTES = relationMetas.find(ele => {
          return ele.RELATION_ID === relation.RELATION_ID;
        }).ATTRIBUTES;
        entityRelations.push(entityRelation);
      });
    });
    return entityRelations;
  }

  _isRelationDisabled(role: Role): boolean {
    if (role.CONDITIONAL_ATTR && role.CONDITIONAL_VALUE) {
      const conditionalValues = role.CONDITIONAL_VALUE.split(`,`);
      return !this.entity[this.entity.ENTITY_ID] ||
        !conditionalValues.includes(this.entity[this.entity.ENTITY_ID][0][role.CONDITIONAL_ATTR]);
    } else {
      return false;
    }
  }

  _convertToFormArray(attributes: Attribute[], instance: any) {
    const markAsDirty = !this.entity.INSTANCE_GUID;
    const formArray = [];
    instance.forEach( line => {
      const lineFormGroup = this.attributeControlService.convertToFormGroup(attributes, line, markAsDirty);
      if (markAsDirty) { lineFormGroup.markAsDirty(); }
      formArray.push(lineFormGroup);
    });
    return new FormArray(formArray);
  }

  _postActivityAfterSaving(data: any) {
    if (data['ENTITY_ID']) {
      this.entity = data;
      this._refreshFormGroupValue(this.entity);
      this.formGroup.reset(this.formGroup.value);
      this._switch2DisplayMode();
      this.messageService.reportMessage('ENTITY', 'ENTITY_SAVED', 'S');
    } else if (Array.isArray(data)) {
      // Error messages are always an array
      data.forEach(err => this.messageService.add(err));
    } else {
      console.log('Unknown return: ' + data);
    }
  }

  _refreshFormGroupValue(entity: Entity) {
    const formGroupValues = {};
    if (!this.entityRelations) { this.entityRelations = this._getEntityRelations(); }
    this.entityRelations.forEach(entityRelation => {
      if ( entityRelation.CARDINALITY === '[0..1]' || entityRelation.CARDINALITY === '[1..1]') {
        formGroupValues[entityRelation.RELATION_ID] =
          entity[entityRelation.RELATION_ID] ? entity[entityRelation.RELATION_ID][0] : {};
      } else {
        formGroupValues[entityRelation.RELATION_ID] =
          entity[entityRelation.RELATION_ID] ? entity[entityRelation.RELATION_ID] : [];
      }
    });
    this.formGroup.reset(formGroupValues);
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.formGroup && this.formGroup.dirty) {
      // @ts-ignore
      return this.dialogService.confirm('Discard changes?');
    } else {
      return true;
    }
  }
}
